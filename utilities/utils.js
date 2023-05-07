

const createdDate = () => {
    const created = new Date();
    const createdDateString = created.toDateString();
    const createdTimeString = created.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false});

    return `${createdDateString} ${createdTimeString}`
}

module.exports = {
    createdDate
}