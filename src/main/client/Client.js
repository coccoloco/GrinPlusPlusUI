import { ipcMain } from 'electron';
import log from 'electron-log';

import SendToHTTP from './SendToHTTP';
import RequestSupport from './RequestSupport';
import GrinboxConnection from '../Grinbox/GrinboxConnection';

// Owner APIs
import CreateWallet from './api/owner/CreateWallet';
import RestoreWallet from './api/owner/RestoreWallet';
import UpdateWallet from './api/owner/UpdateWallet';
import Login from './api/owner/Login';
import Logout from './api/owner/Logout';
import WalletSummary from './api/owner/WalletSummary';
import Send from './api/owner/Send';
import Receive from './api/owner/Receive';
import Finalize from './api/owner/Finalize';
import EstimateFee from './api/owner/EstimateFee';
import Repost from './api/owner/Repost';
import Cancel from './api/owner/Cancel';
import TransactionInfo from './api/owner/TransactionInfo';

// Node APIs
import Shutdown from './api/node/Shutdown';
import GetConnectedPeers from './api/node/GetConnectedPeers';
import GetStatus from './api/node/GetStatus';

function StartOwnerClient() {
    ipcMain.on('CreateWallet', function (event, username, password) {
        CreateWallet.call(event, username, password);
    });

    ipcMain.on("RestoreFromSeed", function (event, username, password, walletWords) {
        RestoreWallet.call(event, username, password, walletWords);
    });

    ipcMain.on("UpdateWallet", function (event, fromGenesis) {
        UpdateWallet.call(event, fromGenesis);
    });

    ipcMain.on('Login', function (event, username, password) {
        Login.call(event, username, password, function (secretKey, address) {
            GrinboxConnection.subscribe(secretKey, address);
        });
    });

    ipcMain.on('Logout', function (event) {
        Logout.call(event);
        GrinboxConnection.unsubscribe();
    });

    ipcMain.on("WalletSummary", function (event) {
        WalletSummary.call(event);
    });

    ipcMain.on("Send", function (event, amount) {
        Send.call(amount, function (result) {
            event.returnValue = result;
        });
    });

    ipcMain.on("Receive", function (event, slate) {
        Receive.call(slate, function (result) {
            event.returnValue = result;
        });
    });

    ipcMain.on("Finalize", function (event, slate) {
        Finalize.call(slate, function (result) {
            event.returnValue = result;
        });
    });

    ipcMain.on("EstimateFee", function (event, amount) {
        EstimateFee.call(amount, function (result) {
            event.returnValue = result;
        });
    });

    ipcMain.on("Repost", function (event, walletTxId) {
        Repost.call(event, walletTxId);
    });

    ipcMain.on("Cancel", function (event, walletTxId) {
        Cancel.call(event, walletTxId);
    });

    ipcMain.on("TransactionInfo", function (event, walletTxId) {
        TransactionInfo.call(event, walletTxId);
    });
}

function start() {
    log.info("Starting Grin++ Client");

    StartOwnerClient();

    ipcMain.on("GetConnectedPeers", function (event) {
        GetConnectedPeers.call(event);
    });

    ipcMain.on('SendToHTTP', function (event, httpAddress, amount) {
        SendToHTTP.call(event, httpAddress, amount);
    });

    ipcMain.on('SendSupportRequest', function (event, name, email, description) {
        RequestSupport.call(event, name, email, description);
    });

    ipcMain.on('Grinbox::Send', function (event, grinboxAddress, amount) {
        // TODO: Validate GrinboxAddress first
        Send.call(amount, function (result) {
            if (result.status_code == 200) {
                event.returnValue = GrinboxConnection.postSlate(result.slate, grinboxAddress);
            } else {
                event.returnValue = result;
            }
        })
    });

    ipcMain.on('Grinbox::GetAddress', function (event) {
        event.returnValue = global.grinbox_address;
    })
}

function stop() {
    GrinboxConnection.disconnect();
    Shutdown.call();
}

function getStatus(callback) {
    GetStatus.call(callback);
}

export default {start, stop, getStatus}