export interface AppResponseInterface {
    setLib(lib: any): AppResponseInterface;
    setStatus(status: number): AppResponseInterface;
    setBody(body: any): AppResponseInterface;
    release();
}

class _AppResponse implements AppResponseInterface {
    private lib: any;
    private code: number = 200;
    private body: {
        code: number,
        data: any
    }
    setLib(lib: any): _AppResponse {
        this.lib = lib;
        return this;
    }
    setStatus(status: number): _AppResponse {
        this.code = status;
        return this;
    }
    setBody(body: any): _AppResponse {
        this.body = {
            code: this.code,
            data: body
        }
        return this;
    }
    release() {
        if (!this.body) {
            throw 'Error Pattern Build[ App Response]'
        }
        return this.lib.status(this.code).json(this.body);
    }
}

const AppResponse = new _AppResponse();
export default AppResponse;