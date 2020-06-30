class Context {
    private scope: any;
    private parent: any;

    constructor(scope: any, parent: any) {
        this.scope = scope;
        this.parent = parent;
    }

    public getScope(identifier: string) : any {
        if (identifier in this.scope) {
            return this.scope[identifier];
        } else if (this.parent !== undefined) {
            return this.parent.getScope(identifier);
        }
    }

}