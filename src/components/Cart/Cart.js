import React, { useContext, useState } from 'react';

import Modal from '../UI/Modal';
import CartItem from './CartItem';
import classes from './Cart.module.css';
import CartContext from '../../store/cart-context';
import Checkout from './Checkout';

const Cart = (props) => {
  const cartCtx = useContext(CartContext);
  const [isCheckout, setIsCheckout] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [didSubmit, setDidSubmit] = useState(false);
  const [httpError, setHttpError] = useState(null);

  const totalAmount = `$${cartCtx.totalAmount.toFixed(2)}`;
  const hasItems = cartCtx.items.length > 0;

  const cartItemRemoveHandler = (id) => {
    cartCtx.removeItem(id);
  };

  const cartItemAddHandler = (item) => {
    cartCtx.addItem(item);
  };

  const orderHandler = () => {
    setIsCheckout(true);
  }

  const submitOrderHandler = async (userData) => {
    setIsSubmiting(true);
    try {
      const response = await fetch('https://react-meals-e593d-default-rtdb.firebaseio.com/orders.json', {
        method: 'POST',
        body: JSON.stringify({
          user: userData,
          cart: cartCtx.items
        }),
      });
      if(!response.ok){
        throw new Error({message :'Something went wrong!!'});
      }
    } catch (error) {
      setHttpError(error.message);
    }
    setIsSubmiting(false);
    setDidSubmit(true);
    cartCtx.clearCart();
  }

  const cartItems = (
    <ul className={classes['cart-items']}>
      {cartCtx.items.map((item) => (
        <CartItem
          key={item.id}
          name={item.name}
          amount={item.amount}
          price={item.price}
          onRemove={cartItemRemoveHandler.bind(null, item.id)}
          onAdd={cartItemAddHandler.bind(null, item)}
        />
      ))}
    </ul>
  );

  const modalActions = <div className={classes.actions}>
    <button className={classes['button--alt']} onClick={props.onClose}>
      Close
    </button>
    {hasItems && <button className={classes.button} onClick={orderHandler}>Order</button>}
  </div>

  const cartModalContent = (
    <React.Fragment>
      {cartItems}
      <div className={classes.total}>
        <span>Total Amount</span>
        <span>{totalAmount}</span>
      </div>
      {isCheckout && <Checkout onConfirm={submitOrderHandler} onCancel={props.onClose}/>}
      {!isCheckout && modalActions}  
    </React.Fragment>);

  const isSubmitingContentModal = <p>Sending order data...</p>
  const didSubmitingContentModal = <React.Fragment>
    <p>Successfully sent the data...</p>
    <div className={classes.actions}>
      <button className={classes.button} onClick={props.onClose}>Close</button>
    </div>
  </React.Fragment>

return (
  <Modal onClose={props.onClose}>
      {!isSubmiting && !didSubmit && cartModalContent}
      {isSubmiting && isSubmitingContentModal}
      {!isSubmiting && didSubmit && didSubmitingContentModal}
      {httpError && <p style={{"color": "red"}}>{httpError}</p>}
    </Modal>
  );
};

export default Cart;
