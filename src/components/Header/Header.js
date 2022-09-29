
import "../Header/Header.scss"

export const Header = ({headerCurrencyValues, logo}) => {
    return (
        <div className={`header`}>
            <div className={`header__logo`}>
                <img src={logo} alt=""/>
            </div>
            <div className={`header__links`}>
                {
                    headerCurrencyValues &&
                        <>
                            <span>1 USD = </span>
                            <span>{headerCurrencyValues} EUR</span>
                        </>

                }
            </div>
        </div>
    )
}
