function OptionGroup({ children, name }) {
  return (
    <fieldset className='option-group'>
      <legend>
        <h2>{name}</h2>
      </legend>
      {children}
    </fieldset>
  );
}

export { OptionGroup };
