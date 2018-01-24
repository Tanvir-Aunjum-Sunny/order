import React from "react"
import { inject, observer } from "mobx-react"
import { Grid, Badge, Cell, Textfield, Checkbox, DataTable, TableHeader, Card, CardText, CardTitle, Chip, IconButton, CardMenu, Button, CardActions, Tabs, Tab } from "react-mdl"

import { map, findIndex } from 'lodash'

@inject('orderStore')
@inject('dishStore')
@inject('dishTypeStore')
@observer
export default class OrdersDetails extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      table: "", 
      name: "",
      notes: "",
      made: false,
      dishes: [],
      order: undefined,
      filter: "",
      offset: 0,
      activeTab: 0
    }
  }

  componentWillMount(){
    const id = this.props.match.params.id
    if (id){
      const order = this.props.orderStore.getOrder(id)
      if (order){
        this.setState({
          name: order.name,
          table: order.table, 
          notes: order.notes, 
          made: order.made, 
          dishes: order.dishes.map(d => Object.assign({}, d)),
          order: order,
          offset: 0,
          activeTab: 0
        })
      }
    }
  }

  goBack(){
    this.props.history.goBack()
  }

  handleNameChange(e){
    this.setState({name: e.target.value})
  }

  handleTableChange(e){
    this.setState({table: e.target.value})
  }

  handleNotesChange(e){
    this.setState({notes: e.target.value})
  }

  handleMadeChage(){
    this.setState({made: !this.state.made})
  }

  handleFilterChange(e){
    this.setState({
      filter: e.target.value,
      offset: 0
    })
  }

  addDish(id){
    return () => {
      const { dishes } = this.state
      const i = findIndex(dishes, { id: id })
      if (i > -1){
          dishes[i].quantity += 1
      }
      else {
        dishes.push({id: id, quantity: 1})
      }
      
      this.setState({dishes: dishes})
    }
  }

  removeDish(id){
    return () => {
      const { dishes } = this.state
      const i = findIndex(dishes, { id: id })
      if (i < -1)
        return
        
      if (dishes[i].quantity == 1)
        dishes.splice(i, 1)
      else
        dishes[i].quantity -= 1
      
      this.setState({dishes: dishes})
    }
  }

  saveOrder(){
    const { name, dishes, table, notes, made, order } = this.state
    if (!name || dishes.length == 0 || !table || isNaN(parseFloat(table)))
      return

    if (this.props.match.params.id){
      order.update({id: order._id, name: name, dishes: dishes, table: table, notes: notes, made: made}, 
        () => { this.goBack() }, 
        (err) => { console.error(err)}
      )
    } else {
      this.props.orderStore.add({table, name, notes, made, dishes }, 
        () => { this.goBack() }, 
        (err) => { console.error(err)}
      )
    }
  }

  pushOffset(){
    if (this.state.offset + 5 < this.props.dishStore.dishes.length){
      this.setState({offset: this.state.offset + 5})
    }
  }

  pullOffset(){
    if (this.state.offset - 5 > -1){
      this.setState({offset: this.state.offset - 5})
    }
  }

  render() {
    const goBack = this.goBack.bind(this)
    const handleNameChange = this.handleNameChange.bind(this)
    const handleTableChange = this.handleTableChange.bind(this)
    const handleNotesChange = this.handleNotesChange.bind(this)
    const handleMadeChage = this.handleMadeChage.bind(this)
    const handleFilterChange = this.handleFilterChange.bind(this)
    const addDish = this.addDish.bind(this)
    const removeDish = this.removeDish.bind(this)
    const saveOrder = this.saveOrder.bind(this)
    const pushOffset = this.pushOffset.bind(this)
    const pullOffset = this.pullOffset.bind(this)

    const matchesFilter = new RegExp(this.state.filter, "i")
    const allDishes = this.props.dishStore.dishes
    const allRows = allDishes.map(d => {
      return({
        id: d._id, 
        name: d.name,
        type: d.type
      })}).filter(e => matchesFilter.test(e.name) && this.props.dishTypeStore.dishTypes[this.state.activeTab]._id === e.type)

    return (
      <Grid className="order-details">
        <Cell col={12}>
          <Card shadow={1} >
            <CardTitle><IconButton name="close" onClick={goBack}/> Order</CardTitle>
            <CardText>
              <Grid>
                <h4>Available Dishes</h4>
                <Cell col={12}>
                  <Tabs activeTab={this.state.activeTab} onChange={(tabId, props) => { console.warn(props); this.setState({ activeTab: tabId }) }} tabBarProps ripple>
                    {this.props.dishTypeStore.dishTypes.map(d => <Tab key={d._id}> {d.name}</Tab>)}
                  </Tabs>
                  <section>
                    <div className="content">
                      {
                        allRows.map((r, i) => <Chip key={r.id} onClick={addDish(r.id)}>{r.name}</Chip>
                        )
                      }
                    </div>
                  </section>
                </Cell>
              </Grid>        
              <Grid>
                <Cell col={6} >
                  <div class="selected-dishes">
                    <h4>Selected Dishes</h4>
                    <DataTable
                      rowKeyColumn="id"
                      rows={this.state.dishes.map(d => {
                        return (
                          {
                            id: d.id,
                            name: this.props.dishStore.getDish(d.id).name,
                            quantity: d.quantity,
                            add: <IconButton name="add" onClick={addDish(d.id)} />,
                            remove: <IconButton name="remove" onClick={removeDish(d.id)} />
                          })
                      })} >
                      <TableHeader numeric name="remove"></TableHeader>
                      <TableHeader numeric name="quantity"></TableHeader>
                      <TableHeader numeric name="add" ></TableHeader>
                      <TableHeader name="name"></TableHeader>
                    </DataTable>
                  </div>
                </Cell>
                <Cell col={6}>
                  <h4>Guest Info</h4>
                  <Textfield
                    onChange={handleTableChange}
                    label="Table"
                    floatingLabel
                    value={this.state.table}
                    pattern={this.state.table ? "[0-9]+" : "" }
                    error="Invalid table number!"
                  /><br/>
                  <Textfield
                    onChange={handleNameChange}
                    label="Name"
                    floatingLabel
                    value={this.state.name}
                    pattern={this.state.name ? "*" : "" }
                    error="Enter a name!"
                  /><br/>
                  <Textfield
                    onChange={handleNotesChange}
                    label="Notes"
                    rows={3}
                    floatingLabel
                    value={this.state.notes}
                  />

                  <Checkbox label="Made" ripple checked={this.state.made} onClick={handleMadeChage} onChange={handleMadeChage}/>
                </Cell>
              </Grid>  
            </CardText>
            <CardActions border>
              <Button colored onClick={saveOrder}>Save</Button>
            </CardActions>
          </Card>
        </Cell>
      </Grid>   
      )
  }
}