import { PrinterOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { get } from 'lodash';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useReactToPrint } from 'react-to-print';
import orderApi from '../../../../../../api/order-api';
import { IOrderBill } from '../../../../../../collections/order';
import { BillToPrintComponent } from '../../../template';

interface Props {
    order: IOrderBill;
    callback?: () => void;
    isNew?: boolean;
}

const OrderPrint: FC<Props> = ({ order, callback, isNew = false }) => {
    const store = useSelector((state: any) => state.store.store);
    const componentRef = useRef<any>();
    const [loading, setLoading] = useState(false);
    const [orderLocal, setOrderLocal] = useState<IOrderBill>(order);

    useEffect(() => {
        async function loadOrder() {
            try {
                const orderId = get(order, '_id');
                if (orderId) {
                    const response: any = await orderApi.getOrder({
                        storeId: store._id,
                        orderId,
                    });

                    setOrderLocal({ ...order, products: response.products });
                }
            } catch (error) {}
        }
        if (isNew) {
            loadOrder();
        }
    }, [isNew, order, store._id]);

    const onPrintError = () => {
        message.error('In hoá đơn thất bại');
        setLoading(false);
    };

    const onAfterPrint = () => {
        setLoading(false);
        if (typeof callback === 'function') {
            callback();
        }
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Hoá đơn ${orderLocal.code}`,
        onBeforeGetContent: () => setLoading(true),
        onAfterPrint: onAfterPrint,
        onPrintError: onPrintError,
        removeAfterPrint: true,
    });

    return (
        <>
            <Button
                type='primary'
                icon={<PrinterOutlined />}
                loading={loading}
                onClick={handlePrint}
            >
                In hóa đơn
            </Button>
            <div style={{ display: 'none' }}>
                <BillToPrintComponent order={orderLocal} ref={componentRef} />
            </div>
        </>
    );
};

export default OrderPrint;
