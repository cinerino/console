"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFromAction = void 0;
const cinerinoapi = require("../cinerinoapi");
// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
function createFromAction(params) {
    var _a, _b, _c, _d, _e;
    const a = params.action;
    let agent = {
        id: '',
        name: 'Unknown'
    };
    if (a.agent !== undefined && a.agent !== null) {
        switch (a.agent.typeOf) {
            case cinerinoapi.factory.personType.Person:
            case 'WebApplication':
                let userPoolId = '';
                let tokenIssuer = '';
                if (Array.isArray(a.agent.identifier)) {
                    const tokenIssuerIdentifier = a.agent.identifier.find((i) => i.name === 'tokenIssuer');
                    if (tokenIssuerIdentifier !== undefined) {
                        tokenIssuer = tokenIssuerIdentifier.value;
                        userPoolId = tokenIssuer.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');
                    }
                }
                const url = `/projects/${params.project.id}/resources/${a.agent.typeOf}/${a.agent.id}?userPoolId=${userPoolId}`;
                let agentName = (typeof a.agent.id === 'string') ? a.agent.id : a.agent.typeOf;
                if (a.agent.name !== undefined) {
                    agentName = a.agent.name;
                }
                else {
                    if (a.agent.familyName !== undefined) {
                        agentName = `${a.agent.givenName} ${a.agent.familyName}`;
                    }
                }
                agent = {
                    id: a.agent.id,
                    name: agentName,
                    url: url
                };
                break;
            case cinerinoapi.factory.organizationType.MovieTheater:
            case cinerinoapi.factory.organizationType.Corporation:
                agent = {
                    id: a.agent.id,
                    name: (typeof a.agent.name === 'string') ? a.agent.name : String((_a = a.agent.name) === null || _a === void 0 ? void 0 : _a.ja),
                    url: `/projects/${params.project.id}/sellers/${a.agent.id}`
                };
                break;
            default:
                agent = {
                    id: a.agent.id,
                    name: (a.agent.name !== undefined && a.agent.name !== null)
                        ? (typeof a.agent.name === 'string') ? a.agent.name : a.agent.name.ja
                        : ''
                };
        }
    }
    let recipient;
    if (a.recipient !== undefined && a.recipient !== null) {
        switch (a.recipient.typeOf) {
            case cinerinoapi.factory.personType.Person:
            case 'WebApplication':
                let userPoolId = '';
                let tokenIssuer = '';
                if (Array.isArray(a.recipient.identifier)) {
                    const tokenIssuerIdentifier = a.recipient.identifier.find((i) => i.name === 'tokenIssuer');
                    if (tokenIssuerIdentifier !== undefined) {
                        tokenIssuer = tokenIssuerIdentifier.value;
                        userPoolId = tokenIssuer.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');
                    }
                }
                const url = `/projects/${params.project.id}/resources/${a.recipient.typeOf}/${a.recipient.id}?userPoolId=${userPoolId}`;
                let recipientName = (typeof a.recipient.url === 'string') ? a.recipient.url
                    : (typeof a.recipient.id === 'string') ? a.recipient.id : a.recipient.typeOf;
                if (a.recipient.name !== undefined) {
                    recipientName = a.recipient.name;
                }
                else {
                    if (a.recipient.familyName !== undefined) {
                        recipientName = `${a.recipient.givenName} ${a.recipient.familyName}`;
                    }
                }
                recipient = {
                    id: a.recipient.id,
                    name: recipientName,
                    url: url
                };
                break;
            case cinerinoapi.factory.organizationType.MovieTheater:
            case cinerinoapi.factory.organizationType.Corporation:
                recipient = {
                    id: a.recipient.id,
                    name: (typeof a.recipient.name === 'string') ? a.recipient.name : String((_b = a.recipient.name) === null || _b === void 0 ? void 0 : _b.ja),
                    url: (typeof a.recipient.url === 'string') ? a.recipient.url : `/projects/${params.project.id}/sellers/${a.recipient.id}`
                };
                break;
            default:
                recipient = {
                    id: a.recipient.id,
                    name: (a.recipient.name !== undefined && a.recipient.name !== null)
                        ? (typeof a.recipient.name === 'string') ? a.recipient.name : a.recipient.name.ja
                        : (typeof a.recipient.url === 'string') ? a.recipient.url : a.recipient.id,
                    url: a.recipient.url
                };
        }
    }
    let actionName;
    switch (a.typeOf) {
        case cinerinoapi.factory.actionType.AuthorizeAction:
            actionName = '承認';
            break;
        case cinerinoapi.factory.actionType.CancelAction:
            actionName = 'キャンセル';
            break;
        case cinerinoapi.factory.actionType.CheckAction:
            actionName = '確認';
            break;
        case cinerinoapi.factory.actionType.ConfirmAction:
            actionName = '確定';
            break;
        case cinerinoapi.factory.actionType.DeleteAction:
            actionName = '削除';
            break;
        case cinerinoapi.factory.actionType.OrderAction:
            actionName = '注文';
            break;
        case cinerinoapi.factory.actionType.GiveAction:
            actionName = '付与';
            break;
        case cinerinoapi.factory.actionType.InformAction:
            actionName = '通知';
            break;
        case cinerinoapi.factory.actionType.MoneyTransfer:
            actionName = '転送';
            break;
        case cinerinoapi.factory.actionType.PayAction:
            actionName = '決済';
            break;
        case cinerinoapi.factory.actionType.PrintAction:
            actionName = '印刷';
            break;
        case cinerinoapi.factory.actionType.RegisterAction:
            actionName = '登録';
            break;
        case cinerinoapi.factory.actionType.ReturnAction:
            if (a.object.typeOf === 'Order') {
                actionName = '返品';
            }
            else {
                actionName = '返却';
            }
            break;
        case cinerinoapi.factory.actionType.RefundAction:
            actionName = '返金';
            break;
        case cinerinoapi.factory.actionType.SendAction:
            if (a.object.typeOf === 'Order') {
                actionName = '配送';
            }
            else {
                actionName = '送信';
            }
            break;
        case cinerinoapi.factory.actionType.UnRegisterAction:
            actionName = '登録解除';
            break;
        default:
            actionName = a.typeOf;
    }
    let object = { name: 'Unknown' };
    try {
        if (a.object !== undefined && a.object !== null) {
            let url;
            if (typeof a.object.typeOf === 'string' && typeof a.object.id === 'string') {
                url = `/projects/${params.project.id}/resources/${a.object.typeOf}/${a.object.id}`;
            }
            object = { name: String(typeof a.object) };
            if (Array.isArray(a.object)) {
                if (typeof ((_c = a.object[0]) === null || _c === void 0 ? void 0 : _c.typeOf) === 'string') {
                    switch (a.object[0].typeOf) {
                        case cinerinoapi.factory.chevre.offerType.Offer:
                            object = { name: `${(_e = (_d = a.object[0]) === null || _d === void 0 ? void 0 : _d.itemOffered) === null || _e === void 0 ? void 0 : _e.typeOf} オファー` };
                            break;
                        case 'PaymentMethod':
                            object = { name: a.object[0].paymentMethod.name };
                            break;
                        case cinerinoapi.factory.actionType.PayAction:
                            object = { name: a.object[0].object.paymentMethod.typeOf };
                            break;
                        default:
                            object = { name: a.object[0].typeOf };
                    }
                }
            }
            else {
                switch (a.object.typeOf) {
                    case cinerinoapi.factory.chevre.offerType.Offer:
                        object = { name: 'オファー' };
                        break;
                    case cinerinoapi.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation:
                        object = { name: '予約' };
                        break;
                    case cinerinoapi.factory.paymentMethodType.CreditCard:
                        object = { name: 'クレジットカード決済' };
                        break;
                    case cinerinoapi.factory.paymentMethodType.Account:
                        object = { name: '口座決済' };
                        break;
                    case cinerinoapi.factory.paymentMethodType.PaymentCard:
                        object = { name: 'ペイメントカード' };
                        break;
                    case cinerinoapi.factory.action.transfer.give.pointAward.ObjectType.PointAward:
                    case cinerinoapi.factory.action.authorize.award.point.ObjectType.PointAward:
                        object = { name: 'ポイント特典' };
                        break;
                    case 'Order':
                        url = `/projects/${params.project.id}/orders/${a.object.orderNumber}`;
                        object = { name: '注文' };
                        break;
                    case 'OwnershipInfo':
                        object = { name: '所有権' };
                        break;
                    case cinerinoapi.factory.creativeWorkType.EmailMessage:
                        object = { name: 'Eメール' };
                        break;
                    case 'PaymentMethod':
                        object = { name: a.object.object[0].paymentMethod.name };
                        break;
                    case cinerinoapi.factory.actionType.PayAction:
                        object = { name: a.object.object[0].paymentMethod.typeOf };
                        break;
                    case cinerinoapi.factory.chevre.transactionType.Reserve:
                        object = { name: '予約取引' };
                        break;
                    case cinerinoapi.factory.chevre.transactionType.MoneyTransfer:
                        object = { name: '通貨転送取引' };
                        break;
                    default:
                        object = { name: a.object.typeOf };
                }
            }
            object.url = url;
        }
    }
    catch (error) {
        // no op
    }
    if (a.typeOf === cinerinoapi.factory.actionType.MoneyTransfer) {
        const amount = a.amount;
        if (typeof amount === 'number') {
            object = { name: String(amount) };
        }
        else {
            object = { name: `${amount.value} ${amount.currency}` };
        }
    }
    let purpose;
    if (Array.isArray(a.purpose)) {
        purpose = { name: 'Array' };
    }
    else if (a.purpose !== undefined && a.purpose !== null) {
        switch (a.purpose.typeOf) {
            case 'Order':
                purpose = {
                    name: '注文',
                    url: `/projects/${params.project.id}/orders/${a.purpose.orderNumber}`
                };
                break;
            case cinerinoapi.factory.transactionType.MoneyTransfer:
            case cinerinoapi.factory.transactionType.PlaceOrder:
            case cinerinoapi.factory.transactionType.ReturnOrder:
                purpose = {
                    name: '取引',
                    url: `/projects/${params.project.id}/transactions/${a.purpose.typeOf}/${a.purpose.id}`
                };
                break;
            default:
                purpose = { name: a.purpose.typeOf };
        }
    }
    let result;
    if (a.result !== undefined && a.result !== null) {
        switch (a.typeOf) {
            case cinerinoapi.factory.actionType.SendAction:
                if (a.object.typeOf === 'Order') {
                    if (Array.isArray(a.result)) {
                        result = a.result.map((o) => {
                            return {
                                name: '所有権',
                                url: `/projects/${params.project.id}/resources/${o.typeOf}/${o.id}`
                            };
                        });
                    }
                    else if (Array.isArray(a.result.ownershipInfos)) {
                        result = a.result.ownershipInfos.map((o) => {
                            return {
                                name: '所有権',
                                url: `/projects/${params.project.id}/resources/${o.typeOf}/${o.id}`
                            };
                        });
                    }
                }
                break;
            case cinerinoapi.factory.actionType.ReturnAction:
                if (a.object.typeOf === 'Order') {
                    if (Array.isArray(a.result)) {
                        result = a.result.map((o) => {
                            return {
                                name: '所有権',
                                url: `/projects/${params.project.id}/resources/${o.typeOf}/${o.id}`
                            };
                        });
                    }
                }
                break;
            case cinerinoapi.factory.actionType.AuthorizeAction:
                if (a.object.typeOf === 'OwnershipInfo') {
                    if (typeof a.result.code === 'string') {
                        result = [{
                                name: '所有権コード',
                                url: `/projects/${params.project.id}/authorizations/${a.result.id}`
                            }];
                    }
                }
                break;
            default:
        }
    }
    let actionStatusDescription;
    switch (a.actionStatus) {
        case cinerinoapi.factory.actionStatusType.ActiveActionStatus:
            actionStatusDescription = 'しようとしています...';
            break;
        case cinerinoapi.factory.actionStatusType.CanceledActionStatus:
            actionStatusDescription = 'しましたが、取り消しました';
            break;
        case cinerinoapi.factory.actionStatusType.CompletedActionStatus:
            actionStatusDescription = 'しました';
            break;
        case cinerinoapi.factory.actionStatusType.FailedActionStatus:
            actionStatusDescription = 'しようとしましたが、失敗しました';
            break;
        case cinerinoapi.factory.actionStatusType.PotentialActionStatus:
            actionStatusDescription = 'する可能性があります';
            break;
        default:
            actionStatusDescription = a.actionStatus;
    }
    return {
        action: a,
        agent,
        recipient,
        actionName,
        object,
        purpose,
        startDate: a.startDate,
        actionStatus: a.actionStatus,
        actionStatusDescription: actionStatusDescription,
        result
    };
}
exports.createFromAction = createFromAction;
