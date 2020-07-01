
function first(value: any) {
    return value[0];
}

function rest(value: any) {
    return value.slice(1);
}

function print(value: any) {
    console.log(value);
    return undefined;
}

function add(...args: any) {
    return args.reduce((previous: any, current: any) => previous + current)
}

function dec(...args: any) {
    return args.reduce((previous: any, current: any) => previous - current)
}

export default {
    first,
    rest,
    print,
    add,
    dec
}