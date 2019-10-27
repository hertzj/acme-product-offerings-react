const root = document.getElementById('root')

const { Component } = React;
const { HashRouter, Route, Link, Switch, Redirect } = ReactRouterDOM;

const Nav = ({ location, products, companies }) => {
    const { pathname } = location
    return (
        <nav>
            <Link to ="companies" className = { pathname === '/companies' ? 'selected' : '' }>Companies({ companies.length })</Link>
            <Link to='products' className = { pathname === '/products' ? 'selected' : '' }>Products({ products.length })</Link>
        </nav>
    );
}

const Products = ({products, offerings, companies}) => {
    const { name, suggestedPrice, descrpition, id } = products;
    const productsData = [];
    products.forEach(product => {
       const newProd = {}
       newProd.name = product.name;
       newProd.suggestedPrice = product.suggestedPrice;
       newProd.description = product.description;

       const newProdOffered = offerings.filter(off => off.productId === product.id);
       newProd.offers = newProdOffered.reduce((acc, {companyId}) => {
           const newComp = companies.filter(company => company.id === companyId)
           acc.push(newComp[0].name)
           return acc
       }, [])

       productsData.push(newProd);
    })
    console.log(productsData)
    return (
        <ul>
           {productsData.map((product, idx) => {
                // eslint-disable-next-line no-unused-expressions
                return (<div key = {idx}> 
                <li>{product.name}</li>
                <li>{product.suggestedPrice}</li>
                <li>{product.description}</li>
                <li>Offered by:
                    <ul>
                        {product.offers.map((company, idx) => <li key = {idx}>{company}</li>)}
                    </ul>
                </li>
                </div>
                )
           })}
        </ul>
    )
}

const Companies = ({products, offerings, companies}) => {
    const companiesData = [];
    companies.forEach(company => {
        const newComp = {}
        newComp.name = company.name;
        newComp.phrase = company.catchPhrase;

        const newCompOfferings = offerings.filter(offering => offering.companyId === company.id);

        newComp.offs = newCompOfferings.reduce((acc, offering) => {
            const product = products.filter(prod => prod.id === offering.productId)
            const newProd = {}
            newProd.name = product[0].name;
            newProd.price = offering.price;
            acc.push(newProd);
            return acc;
        }, [])

        companiesData.push(newComp)
    })
    

    return (
        <ul>
            {companiesData.map((company, idx) => {
                return (
                    <div key={idx}>
                        <li>{company.name}</li>
                        <li>{company.phrase}</li>
                        <li>Offering: 
                            <ul>
                                {company.offs.map((off, idx) => <li key={idx}>{off.name} - {off.price}</li>)}
                            </ul>
                        </li>
                    </div>
                )
            })}
        </ul>
    )

}


class App extends Component {
    constructor() {
        super()
        this.state = {
            companies : [],
            products: [],
            offerings: [],
        }
    }

    componentDidMount() {
        const companies = axios.get('https://acme-users-api-rev.herokuapp.com/api/companies').then(values => values.data);
        const products = axios.get('https://acme-users-api-rev.herokuapp.com/api/products').then(values => values.data);
        const offerings = axios.get('https://acme-users-api-rev.herokuapp.com/api/offerings').then(values => values.data);
        Promise.all([companies, products, offerings])
            .then(values => this.setState({
                companies: values[0],
                products: values[1],
                offerings: values[2],
            }))

    }

    render() {
        const { companies, products, offerings } = this.state;
        return (
            <HashRouter>
                <Route render = {(props) => <Nav {...props} products = { products } companies = { companies } /> } />
                <Switch>
                    <Route path ='/products' render = {(props) => <Products products = { products } companies = { companies } offerings = { offerings } />} />
                    <Route path ='/companies' render = {(props) => <Companies products = { products } companies = { companies } offerings = { offerings } />} />
                    <Redirect to='/companies' />
                </Switch>
            </HashRouter>
        )
    }
}


ReactDOM.render(<App />, root);