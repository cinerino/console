import * as cinerinoapi from '../cinerinoapi';

/**
 * タイムラインインターフェース
 */
export interface ITimeline {
    action: any;
    agent: {
        id: string;
        name: string;
        url?: string;
    };
    recipient?: {
        id: string;
        name: string;
        url?: string;
    };
    actionName: string;
    object: {
        name: string;
        url?: string;
    };
    purpose?: {
        name: string;
        url?: string;
    };
    startDate: Date;
    actionStatus: string;
    actionStatusDescription: string;
    result: any;
}

// tslint:disable-next-line:cyclomatic-complexity max-func-body-length
export function createFromAction(params: {
    project: cinerinoapi.factory.project.IProject;
    action: cinerinoapi.factory.action.IAction<cinerinoapi.factory.action.IAttributes<any, any, any>>;
}): ITimeline {
    const a = params.action;

    let agent: {
        id: string;
        name: string;
        url?: string;
    } = {
        id: '',
        name: 'Unknown'
    };

    if (a.agent !== undefined && a.agent !== null) {
        if (a.agent.typeOf === cinerinoapi.factory.personType.Person) {
            let userPoolId = '';
            let tokenIssuer = '';
            if (Array.isArray(a.agent.identifier)) {
                const tokenIssuerIdentifier = a.agent.identifier.find((i: any) => i.name === 'tokenIssuer');
                if (tokenIssuerIdentifier !== undefined) {
                    tokenIssuer = tokenIssuerIdentifier.value;
                    userPoolId = tokenIssuer.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');
                }
            }

            const url = (a.agent.memberOf !== undefined)
                ? `/projects/${params.project.id}/userPools/${userPoolId}/people/${a.agent.id}`
                : `/projects/${params.project.id}/userPools/${userPoolId}/clients/${a.agent.id}`;

            let agentName = (typeof a.agent.id === 'string') ? a.agent.id : a.agent.typeOf;
            if (a.agent.name !== undefined) {
                agentName = a.agent.name;
            } else {
                if (a.agent.familyName !== undefined) {
                    agentName = `${a.agent.givenName} ${a.agent.familyName}`;
                }
            }

            agent = {
                id: a.agent.id,
                name: agentName,
                url: url
            };
        } else if (a.agent.typeOf === cinerinoapi.factory.organizationType.MovieTheater
            || a.agent.typeOf === cinerinoapi.factory.organizationType.Corporation) {
            agent = {
                id: a.agent.id,
                name: (typeof a.agent.name === 'string') ? a.agent.name : a.agent.name.ja,
                url: `/projects/${params.project.id}/sellers/${a.agent.id}`
            };
        } else {
            agent = {
                id: a.agent.id,
                name: (a.agent.name !== undefined && a.agent.name !== null)
                    ? (typeof a.agent.name === 'string') ? a.agent.name : a.agent.name.ja
                    : ''
            };
        }
    }

    let recipient: {
        id: string;
        name: string;
        url?: string;
    } | undefined;

    if (a.recipient !== undefined && a.recipient !== null) {
        if (a.recipient.typeOf === cinerinoapi.factory.personType.Person) {
            let userPoolId = '';
            let tokenIssuer = '';
            if (Array.isArray(a.recipient.identifier)) {
                const tokenIssuerIdentifier = a.recipient.identifier.find((i: any) => i.name === 'tokenIssuer');
                if (tokenIssuerIdentifier !== undefined) {
                    tokenIssuer = tokenIssuerIdentifier.value;
                    userPoolId = tokenIssuer.replace('https://cognito-idp.ap-northeast-1.amazonaws.com/', '');
                }
            }

            const url = (a.recipient.memberOf !== undefined)
                ? `/projects/${params.project.id}/userPools/${userPoolId}/people/${a.recipient.id}`
                : `/projects/${params.project.id}/userPools/${userPoolId}/clients/${a.recipient.id}`;

            let recipientName = (typeof a.recipient.url === 'string') ? a.recipient.url
                : (typeof a.recipient.id === 'string') ? a.recipient.id : a.recipient.typeOf;
            if (a.recipient.name !== undefined) {
                recipientName = a.recipient.name;
            } else {
                if (a.recipient.familyName !== undefined) {
                    recipientName = `${a.recipient.givenName} ${a.recipient.familyName}`;
                }
            }

            recipient = {
                id: a.recipient.id,
                name: recipientName,
                url: url
            };
        } else if (a.recipient.typeOf === cinerinoapi.factory.organizationType.MovieTheater
            || a.recipient.typeOf === cinerinoapi.factory.organizationType.Corporation) {
            recipient = {
                id: a.recipient.id,
                name: (typeof a.recipient.name === 'string') ? a.recipient.name : a.recipient.name.ja,
                url: (typeof a.recipient.url === 'string') ? a.recipient.url : `/projects/${params.project.id}/sellers/${a.recipient.id}`

            };
        } else {
            recipient = {
                id: a.recipient.id,
                name: (a.recipient.name !== undefined && a.recipient.name !== null)
                    ? (typeof a.recipient.name === 'string') ? a.recipient.name : a.recipient.name.ja
                    : (typeof a.recipient.url === 'string') ? a.recipient.url : a.recipient.id,
                url: a.recipient.url
            };
        }
    }

    let actionName: string;
    switch (a.typeOf) {
        case cinerinoapi.factory.actionType.AuthorizeAction:
            actionName = '承認';
            break;
        case cinerinoapi.factory.actionType.CheckAction:
            actionName = '確認';
            break;
        case cinerinoapi.factory.actionType.DeleteAction:
            actionName = '削除';
            break;
        case cinerinoapi.factory.actionType.OrderAction:
            actionName = '注文';
            break;
        case cinerinoapi.factory.actionType.ConfirmAction:
            actionName = '確定';
            break;
        case cinerinoapi.factory.actionType.GiveAction:
            actionName = '付与';
            break;
        case cinerinoapi.factory.actionType.InformAction:
            actionName = '通知';
            break;
        case cinerinoapi.factory.actionType.PayAction:
            actionName = '支払';
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
            } else {
                actionName = '返却';
            }
            break;
        case cinerinoapi.factory.actionType.RefundAction:
            actionName = '返金';
            break;
        case cinerinoapi.factory.actionType.SendAction:
            if (a.object.typeOf === 'Order') {
                actionName = '配送';
            } else {
                actionName = '送信';
            }
            break;
        case cinerinoapi.factory.actionType.UnRegisterAction:
            actionName = '登録解除';
            break;
        default:
            actionName = a.typeOf;
    }

    let object: {
        name: string;
        url?: string;
    } = { name: 'Unknown' };
    if (a.object !== undefined && a.object !== null) {
        let url: string | undefined;
        if (typeof a.object.typeOf === 'string' && typeof a.object.id === 'string') {
            url = `/projects/${params.project.id}/resources/${a.object.typeOf}/${a.object.id}`;
        }

        if (Array.isArray(a.object)) {
            switch (a.object[0].typeOf) {
                case 'PaymentMethod':
                    object = { name: a.object[0].paymentMethod.name };
                    break;
                case cinerinoapi.factory.actionType.PayAction:
                    object = { name: a.object[0].object.paymentMethod.typeOf };
                    break;
                default:
                    object = a.object[0].typeOf;
            }
        } else {
            switch (a.object.typeOf) {
                case cinerinoapi.factory.action.authorize.offer.seatReservation.ObjectType.SeatReservation:
                    object = { name: '座席予約' };
                    break;
                case cinerinoapi.factory.paymentMethodType.CreditCard:
                    object = { name: 'クレジットカード決済' };
                    break;
                case cinerinoapi.factory.paymentMethodType.Account:
                    object = { name: '口座決済' };
                    break;
                case cinerinoapi.factory.action.authorize.award.point.ObjectType.PointAward:
                    object = { name: 'ポイントインセンティブ' };
                    break;
                case 'Order':
                    url = `/projects/${params.project.id}/orders/${a.object.orderNumber}`;
                    object = { name: '注文' };
                    break;
                case 'OwnershipInfo':
                    object = { name: '所有権' };
                    break;
                case cinerinoapi.factory.action.transfer.give.pointAward.ObjectType.PointAward:
                    object = { name: 'ポイント' };
                    break;
                case cinerinoapi.factory.actionType.SendAction:
                    if (a.object.typeOf === 'Order') {
                        object = { name: '配送' };
                    } else if (a.object.typeOf === cinerinoapi.factory.creativeWorkType.EmailMessage) {
                        object = { name: '送信' };
                    } else {
                        object = { name: '送信' };
                    }
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
                case 'ProgramMembership':
                    object = { name: '会員プログラム' };
                    break;
                default:
                    object = { name: a.object.typeOf };
            }
        }

        object.url = url;
    }

    let purpose: {
        name: string;
        url?: string;
    } | undefined;
    if (Array.isArray(a.purpose)) {
        purpose = { name: 'Array' };
    } else if (a.purpose !== undefined && a.purpose !== null) {
        switch (a.purpose.typeOf) {
            case 'Order':
                purpose = {
                    name: '注文',
                    url: `/projects/${params.project.id}/orders/${(<any>a.purpose).orderNumber}`
                };
                break;

            case cinerinoapi.factory.transactionType.MoneyTransfer:
            case cinerinoapi.factory.transactionType.PlaceOrder:
            case cinerinoapi.factory.transactionType.ReturnOrder:
                purpose = {
                    name: '取引',
                    url: `/projects/${params.project.id}/transactions/${a.purpose.typeOf}/${(<any>a.purpose).id}`
                };
                break;

            default:
                purpose = { name: a.purpose.typeOf };
        }
    }

    let result: any;
    if (a.result !== undefined && a.result !== null) {
        switch (a.typeOf) {
            case cinerinoapi.factory.actionType.SendAction:
                if (a.object.typeOf === 'Order') {
                    if (Array.isArray(a.result)) {
                        result = a.result.map((o: any) => {
                            return {
                                name: '所有権',
                                url: `/projects/${params.project.id}/resources/${o.typeOf}/${o.id}`
                            };
                        });
                    } else if (Array.isArray(a.result.ownershipInfos)) {
                        result = a.result.ownershipInfos.map((o: any) => {
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
                        result = a.result.map((o: any) => {
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

    let actionStatusDescription: string;
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
