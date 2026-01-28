export function handleChange(e, setItem) {
    const { name, value } = e.target;
    setItem(prev => ({
        ...prev,
        [name]: value
    }))
}

export function handleChangeSolo(e, setItem) {
  setItem(e.target.value);
}
