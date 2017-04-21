/*
Copyright 2017 OpenFin Inc.

Licensed under OpenFin Commercial License you may not use this file except in compliance with your Commercial License.
Please contact OpenFin Inc. at sales@openfin.co to obtain a Commercial License.
*/
/*
  Because the runtime-p2p module may or may not be there, this module provides
  a uniform interface to either the real p2p module or a safe stubbed out version
*/

// built-in modules
declare let process: any;
const app = require('electron').app;
import { EventEmitter } from 'events';

// npm modules
// (none)

// local modules
const coreState = require('./core_state');
import * as log from './log';


const multiRuntimeCommandLineFlag = 'enable-multi-runtime';
const multiRuntimeEnabled = coreState.argo[multiRuntimeCommandLineFlag];

let connectionManager: any;
let meshEnabled = false;

buildNoopConnectionManager();

if (multiRuntimeEnabled) {

    try {
        connectionManager = require('runtime-p2p').connectionManager;
        meshEnabled = true;
        log.writeToLog('info', 'multi-runtime mode enabled');
    } catch (e) {
        log.writeToLog('info', e.message);
    }
}

function buildNoopConnectionManager() {
    connectionManager = new EventEmitter();
    connectionManager.connectToRuntime = () => {
        return new Promise((resolve, reject) => {
            reject();
        });
    };

    connectionManager.resolveIdentity = () => {
        return new Promise((resolve, reject) => {
            reject();
        })
    };

    connectionManager.connections = [];
}


/*
  Note that these should match the definitions found here:
  https://github.com/openfin/runtime-p2p/blob/master/src/connection_manager.ts
*/

interface Identity {
    uuid: string;
    name?: string;
}

interface PeerRuntime {
    portInfo: PortInfo;
    fin: any;
    isDisconnected: boolean;
}

interface IdentityAddress {
    runtime: PeerRuntime;
    runtimeKey: string;
    identity: Identity;
}

interface PortInfo {
    version: any;
    sslPort: number;
    port: number;
    requestedVersion?: string;
    securityRealm?: string;
    runtimeInformationChannel?: string;
}

interface ConnectionManager extends EventEmitter {
    connections: Array<PeerRuntime>;
    connectToRuntime: (uuid: string, portInfo: PortInfo) => Promise<PeerRuntime>;
    resolveIdentity(identity: Identity): Promise<IdentityAddress>;
}


export default connectionManager as ConnectionManager;
export  { meshEnabled };