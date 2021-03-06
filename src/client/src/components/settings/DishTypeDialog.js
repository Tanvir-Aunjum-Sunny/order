import React, { Component } from 'react'
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import {  ToolbarIcon } from 'rmwc/Toolbar';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogButton
} from '@rmwc/dialog';
import { TextField } from 'rmwc/TextField';
import {
  ListItem,
  ListItemText,
  ListItemMeta } from 'rmwc/List';

const ADD = gql` mutation add($name: String!){
 addDishType(name: $name){
   _id, 
   name
 }
}`
const UPDATE = gql`mutation update($id: ID!, $name: String!){
 updateDishType(_id: $id, name: $name){
   _id, 
   name
 }
}`
const REMOVE = gql`mutation remove($id: ID!){
 removeDishType(_id: $id, ){
   _id, 
   name
 }
}`

export default class DishTypeDialog extends Component{
  constructor(props){
    super(props)
    this.state = {name: ""}

    this.handleNameChange = this.handleNameChange.bind(this)
  }
  

  componentWillReceiveProps(newProps, oldProps){
    if (newProps.name && newProps.name !== oldProps.name ){
      this.setState({ name: newProps.name })
    }
  }

  componentDidMount(){
    if (this.props.name)
      this.setState({ name: this.props.name })
  }

  toggleDialog(){
    return () => {
      this.setState({name: this.props.name, standardDialogOpen: !this.state.standardDialogOpen})
    }
  }

  handleNameChange(e){
    this.setState({name: e.target.value || ''})
  }

  render(){
    return (
      <React.Fragment>
        <Dialog
          open={this.state.standardDialogOpen}
          onClose={evt => this.setState({ standardDialogOpen: false })}
        >
          <DialogTitle>{this.props._id ? "Edit dish type" : "New dish type"}</DialogTitle>
            <DialogContent>
              <TextField type="text" label="Name" value={this.state.name || ''} onChange={this.handleNameChange} />
            </DialogContent>
            <DialogActions >
              <DialogButton  theme="secondary" action="cancel" isDefaultAction >Cancel</DialogButton>
              {
                this.props._id ?
                  <Mutation mutation={REMOVE}>
                    {(remove) =>
                      <DialogButton action="accept" onClick={() => remove({ variables: { id: this.props._id } })}>Delete</DialogButton>
                    }
                  </Mutation>
                : String()
              }
              <Mutation mutation={this.props._id ? UPDATE : ADD}>
                {(addOrUpdate) =>
                  <DialogButton action="accept" onClick={() => addOrUpdate({variables: { id: this.props._id, name: this.state.name}})}>Save</DialogButton>
                }
              </Mutation>
            </DialogActions>
        </Dialog>
        {
          this.props._id ?
            <ListItem onClick={this.toggleDialog()}>
              <ListItemText>{this.props.name}</ListItemText>
              <ListItemMeta icon="edit" />
            </ListItem> :
            <ToolbarIcon icon="add" onClick={this.toggleDialog()} />
        }
      </React.Fragment>
    )
  }
}