import React, { useState, useEffect } from 'react';
import { Select, Spin, Alert, Button } from 'antd';
import CurrencyInput from '../CurrencyInput';
import axios from 'axios';

const { Option } = Select;

const CurrencyConverter = () => {
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [targetCurrency, setTargetCurrency] = useState('EUR');
    const [amount, setAmount] = useState('');
    const [exchangeRate, setExchangeRate] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [convertedAmount, setConvertedAmount] = useState(0);
    const [isSameCurrency, setIsSameCurrency] = useState(false);
    const API_KEY = '39d777169b5f4c7bbe09bb7c4a4b0d97';

    let source;

    const handleBaseCurrencyChange = (value) => {
        if (value) {
            if (value === targetCurrency) {
                setIsSameCurrency(true);
                setError('Выберите разные валюты');
            } else {
                setIsSameCurrency(false);
                setBaseCurrency(value);
                fetchExchangeRate(value, targetCurrency);
            }
        } else {
            setError('Выберите базовую валюту');
        }
    };

    const handleTargetCurrencyChange = (value) => {
        if (value) {
            if (value === baseCurrency) {
                setIsSameCurrency(true);
                setError('Выберите разные валюты');
            } else {
                setIsSameCurrency(false);
                setTargetCurrency(value);
                fetchExchangeRate(baseCurrency, value);
            }
        } else {
            setError('Выберите целевую валюту');
        }
    };

    const handleAmountChange = (value) => {
        if (!isNaN(value) && parseFloat(value) >= 0) {
            setAmount(value);
        } else {
            setError('Введите корректную положительную сумму');
        }
    };

    const handleRetry = () => {
        setError(null);
        fetchData();
    };

    const fetchExchangeRate = async (base, target) => {
        if (source) {
            source.cancel('Request canceled');
        }

        setLoading(true);
        setError(null);

        source = axios.CancelToken.source();

        try {
            const response = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=${API_KEY}`, {
                cancelToken: source.token,
            });

            const data = response.data;

            if (response.status === 200 && data.rates) {
                const rate = data.rates[target];
                setExchangeRate(rate);
            } else {
                setError('Ошибка при получении курса обмена');
            }
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled', error.message);
            } else {
                setError('Ошибка при получении курса обмена');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        return () => {
            if (source) {
                source.cancel('Request canceled');
            }
        };
    }, [baseCurrency, targetCurrency]);

    const fetchData = () => {
        fetchExchangeRate(baseCurrency, targetCurrency);
    };

    const convertCurrency = () => {
        try {
            const convertedAmount = parseFloat(amount) * exchangeRate;
            setConvertedAmount(convertedAmount.toFixed(2));
        } catch (error) {
            setError('Произошла ошибка при конвертации валюты');
        }
    };

    const handleConvert = () => {
        if (parseFloat(amount) > 0) {
            convertCurrency();
        } else {
            setError('Введите корректную положительную сумму');
        }
    };

    return (
        <div>
            <Select value={baseCurrency} onChange={handleBaseCurrencyChange}>
                <Option value="USD">USD</Option>
                <Option value="EUR">EUR</Option>
                <Option value="GBP">GBP</Option>
                <Option value="JPY">JPY</Option>
                <Option value="CAD">CAD</Option>
            </Select>
            <CurrencyInput value={amount} onChange={handleAmountChange} />
            <Select value={targetCurrency} onChange={handleTargetCurrencyChange}>
                <Option value="USD">USD</Option>
                <Option value="EUR">EUR</Option>
                <Option value="GBP">GBP</Option>
                <Option value="JPY">JPY</Option>
                <Option value="CAD">CAD</Option>
            </Select>
            <Button type="primary" onClick={handleConvert}>Конвертировать</Button>
            {isSameCurrency && <Alert message="Выберите разные валюты" type="error" />}
            {loading && <Spin />}
            {error && (
                <div>
                    <Alert message={`Произошла ошибка: ${error}`} type="error" />
                    <Button onClick={handleRetry}>Повторить</Button>
                </div>
            )}
            {exchangeRate > 0 && (
                <p>
                    Конвертированная сумма: {amount} {baseCurrency} = {convertedAmount} {targetCurrency}
                </p>
            )}
        </div>
    );
};

export default CurrencyConverter;
