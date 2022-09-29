import logo from './logo.svg';
import './App.css';
import {useEffect, useRef, useState} from "react";
import {Header} from "./components/Header/Header";
import './variables.scss'
import "./styles.scss"
import arrow from "./images/arrow-img.png"

function App() {
    //states
    const [currencies, setCurrencies] = useState([]);
    const [errorMessage, setErrorMessage] = useState();
    const [firstCurrencyInput, setFirstCurrencyInput] = useState({curr: '', amount: '1'});
    const [secondCurrencyInput, setSecondCurrencyInput] = useState({curr: '', amount: ''});
    const [lastChanged, setLastChanged] = useState({key: '', name: ''});
    const [headerCurrencyValues, setHeaderCurrencyValues] = useState();
    const [arrowDirection, setArrowDirection] = useState('right');
    //End states

    //get Currency Data From Inputs
    const getCurrenciesDataFromInputs = (e, key) => {
        if(key === 'first') {
            setFirstCurrencyInput({...firstCurrencyInput, [e.target.name]: e.target.value})
        }
        else {
            setSecondCurrencyInput({...secondCurrencyInput, [e.target.name]: e.target.value})
        }
        setLastChanged({key: key, name: e.target.name})
    }
    //End get Currency Data From Inputs

    //change arrow direction
    const changeArrowDirection = (flag) => {
        if(firstCurrencyInput.curr && firstCurrencyInput.amount && secondCurrencyInput.curr && !secondCurrencyInput.amount) {
            setArrowDirection('right')
        }
        if(firstCurrencyInput.curr && !firstCurrencyInput.amount && secondCurrencyInput.curr && secondCurrencyInput.amount) {
            setArrowDirection('left')
        }

        if(firstCurrencyInput.curr && firstCurrencyInput.amount && secondCurrencyInput.curr && secondCurrencyInput.amount && lastChanged.key === 'first') {
            setArrowDirection( 'right')
        }
        if(firstCurrencyInput.curr && firstCurrencyInput.amount && secondCurrencyInput.curr && secondCurrencyInput.amount && lastChanged.key === 'second') {
            setArrowDirection( 'left')
        }
    }

    useEffect(() => {
        changeArrowDirection()
    }, [firstCurrencyInput.curr, firstCurrencyInput.amount, secondCurrencyInput.curr, secondCurrencyInput.amount, lastChanged.key])
    //End change arrow direction

    // page load request
    useEffect(() => {
        const host = 'api.frankfurter.app';

        fetch(`https://${host}/latest?amount=1&from=USD&to=EUR`)
            .then(resp => resp.json())
            .then((data) => {
                setHeaderCurrencyValues(data.rates['EUR'])
            });

        fetch(`https://${host}/currencies`)
            .then(resp => resp.json())
            .then((data) => {
                let currencyTemp = Object.entries(data)
                setCurrencies(currencyTemp)
                setFirstCurrencyInput({...firstCurrencyInput, curr: currencyTemp[0][0]})
                setSecondCurrencyInput({...secondCurrencyInput, curr: currencyTemp[0][0]})
            });
    }, [])
    // End page load request

    // check errors
    useEffect(() => {
        if(errorMessage !== '' && (firstCurrencyInput.amount || secondCurrencyInput.amount)) {
            setErrorMessage('')
        }
        if(firstCurrencyInput.curr !== secondCurrencyInput.curr) {
            setErrorMessage('')
        }
    },[firstCurrencyInput.amount, secondCurrencyInput.amount, firstCurrencyInput.curr, secondCurrencyInput.curr])
    //End check errors

    //send exchange rate request
    const sendRequest = async () => {
        if(!firstCurrencyInput.amount && !secondCurrencyInput.amount) {
            return setErrorMessage('Enter at least one amount!')
        }
        if(firstCurrencyInput.curr === secondCurrencyInput.curr) {
            return setErrorMessage('Please select different currencies!')
        }

        let urlParams = {amount: '', currencyFrom: '', currencyTo: ''};

        if(firstCurrencyInput.curr && firstCurrencyInput.amount && secondCurrencyInput.curr && !secondCurrencyInput.amount) {
            urlParams= {amount: firstCurrencyInput.amount, currencyFrom: firstCurrencyInput.curr, currencyTo: secondCurrencyInput.curr}
        }
        if(secondCurrencyInput.curr && secondCurrencyInput.amount && firstCurrencyInput.curr && !firstCurrencyInput.amount) {
            urlParams = {amount: secondCurrencyInput.amount, currencyFrom: secondCurrencyInput.curr, currencyTo: firstCurrencyInput.curr}
        }
        if(firstCurrencyInput.curr && firstCurrencyInput.amount && secondCurrencyInput.curr && secondCurrencyInput.amount) {
            if(lastChanged.key === 'first') {
                urlParams = {amount: firstCurrencyInput.amount, currencyFrom: firstCurrencyInput.curr, currencyTo: secondCurrencyInput.curr}
            }
            if(lastChanged.key === 'second') {
                urlParams = {amount: secondCurrencyInput.amount, currencyFrom: secondCurrencyInput.curr, currencyTo: firstCurrencyInput.curr}
            }
        }

        const host = 'api.frankfurter.app';
        await fetch(`https://${host}/latest?amount=${urlParams.amount}&from=${urlParams.currencyFrom}&to=${urlParams.currencyTo}`)
            .then(resp => resp.json())
            .then((data) => {
                console.log('response data', data)
                if(firstCurrencyInput.curr.includes(data.base)) {
                    return setSecondCurrencyInput({...secondCurrencyInput, amount: data.rates[secondCurrencyInput.curr]})
                }
                return setFirstCurrencyInput({...firstCurrencyInput, amount: data.rates[firstCurrencyInput.curr]})
            });
    }
    //End send exchange rate request

    return (
    <div className="App">
        <Header headerCurrencyValues={headerCurrencyValues} logo={logo} />
        <div className={`converter__main`}>
            <div className={`converter__main-wrapper`}>
                <div className={`converter__error-message`}>
                    {errorMessage !== '' ? <span>{errorMessage}</span> : ''}
                </div>
                <div  className={`converter__inputs-part-wrapper`}>
                    <div className={`converter__inputs-part`}>
                        <select
                            className={`converter__currency-select`}
                            name={`curr`}
                            onChange={(e) => {getCurrenciesDataFromInputs(e, 'first'); changeArrowDirection()}}
                        >
                            {
                                currencies.map((item) => {
                                    return <option key={item[0]} value={item[0]}>{item[0]} - {item[1]}</option>
                                })
                            }
                        </select>
                        <label htmlFor="">
                            <span></span>
                            <input
                                className={`converter__input`}
                                placeholder={`Amount`}
                                value={firstCurrencyInput.amount}
                                type="number"
                                name={`amount`}
                                onChange={(e) => {getCurrenciesDataFromInputs(e, 'first'); changeArrowDirection()}}
                            />
                        </label>
                    </div>
                    <div className={`converter__change-direction ${arrowDirection === 'right' ? 'right' : 'left' }`}>
                        <img src={arrow} alt=""/>
                    </div>
                    <div className={`converter__inputs-part`}>
                        <select
                            className={`converter__currency-select 22`}
                            name={`curr`}
                            onChange={(e) => {getCurrenciesDataFromInputs(e, 'second'); changeArrowDirection()}}
                        >
                            {
                                currencies.map((item) => {
                                    return <option key={item[0]} value={item[0]}>{item[0]} - {item[1]}</option>
                                })
                            }
                        </select>
                        <label htmlFor="">
                            <span></span>
                            <input
                                className={`converter__input`}
                                placeholder={`Amount`}
                                value={secondCurrencyInput.amount}
                                type="number"
                                name={`amount`}
                                onChange={(e) => {getCurrenciesDataFromInputs(e, 'second'); changeArrowDirection()}}
                            />
                        </label>
                    </div>
                </div>
                <button className={`converter__button`} onClick={() => {sendRequest()}}>ok</button>
            </div>
        </div>
    </div>
  );
}

export default App;
