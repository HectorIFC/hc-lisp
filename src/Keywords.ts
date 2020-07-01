import { Context } from "./Context";
import { interpret } from "./Interpret";

function lett(input: any, context: any) {
    var letContext = input[1].reduce(function(acc: any, x: any) {
    acc.scope[x[0].value] = interpret(x[1], context);
    return acc;
    }, new Context({}, context));

    return interpret(input[2], letContext);
}

function lambda(input: any, context: any) {
    return function() {
    var lambdaArguments = arguments;
    var lambdaScope = input[1].reduce(function(acc: any, x: any, i: any) {
        acc[x.value] = lambdaArguments[i];
        return acc;
    }, {});

    return interpret(input[2], new Context(lambdaScope, context));
    };
}

function iff(input: any, context: any) {
    return interpret(input[1], context) ?
    interpret(input[2], context) :
    interpret(input[3], context);
}


export default {
    lett,
    lambda,
    iff
};
