class Context {
    private scope: any;
    private parent: any;

    constructor(scope: any, parent: any) {
        this.scope = scope;
        this.parent = parent;
    }
}