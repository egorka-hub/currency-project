import React from 'react';
import { InputNumber } from 'antd';

const CurrencyInput = ({ value, onChange }) => {
    const handleAmountChange = (value) => {
        onChange(value);
    };

    return (
        <InputNumber min={0} value={value} onChange={handleAmountChange} />
    );
};

export default CurrencyInput;
