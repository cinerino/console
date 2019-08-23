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
    };
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

    let actionName: string;
    switch (a.typeOf) {
        case cinerinoapi.factory.actionType.AuthorizeAction:
            actionName = '承認';
            break;
        case cinerinoapi.factory.actionType.ConfirmAction:
            actionName = '確定';
            break;
        case cinerinoapi.factory.actionType.OrderAction:
            actionName = '注文';
            break;
        case cinerinoapi.factory.actionType.GiveAction:
            actionName = '付与';
            break;
        case cinerinoapi.factory.actionType.SendAction:
            if (a.object.typeOf === 'Order') {
                actionName = '配送';
            } else {
                actionName = '送信';
            }
            break;
        case cinerinoapi.factory.actionType.PayAction:
            actionName = '支払';
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
        default:
            actionName = a.typeOf;
    }

    let object: {
        name: string;
        url?: string;
    };
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
                object = { name: '注文', url: `/projects/${params.project.id}/orders/${a.object.orderNumber}` };
                break;
            case 'OwnershipInfo':
                object = { name: '所有権', url: `/projects/${params.project.id}/resources/${a.object.typeOf}/${a.object.id}` };
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
            default:
                object = { name: a.object.typeOf };
        }
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
        actionName,
        object,
        purpose,
        startDate: a.startDate,
        actionStatus: a.actionStatus,
        actionStatusDescription: actionStatusDescription,
        result
    };
}
