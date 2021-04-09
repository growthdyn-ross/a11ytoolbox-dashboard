import axios from 'axios'
import Vue from 'vue'

class Request {
    /* Args to pass:
        - params ~ Object: additional data to be sent with the request
        - onError ~ Object or Boolean: 
            - Object: Contains information on how to handle notifications and callbacks.
            Properties:
                - silent - Boolean: If true, will not display a notification
                - callback - function
                * All properties available at https://github.com/euvl/vue-notification#component-props
            - True: Uses the default values to notify. No default callback
            - False: Does not notify the user
        - onSuccess ~ Object or Boolean: Same as onError
        - onInfo ~ Object or Boolean: Same as onError
        - onWarn ~ Object or Boolean: Same as onError
        - router ~ The router object for redirecting a user

        **Example:
        args = {
            params: { user_id: id },
            onSuccess: {
                silent: true
            },
            onError: {
                title: 'Error',
                text: 'There was an error updating your project',
                type: 'error',
                callback: ()=>{
                    router.push({path: '/'})
                }
            },
            router: this.$router
        }
    */

    
    constructor(){
        this.defaultError = {
            title: 'Error',
            type: 'error'
        }
        this.defaultSuccess = {
            title: 'Success',
            type: 'success'
        }
        this.defaultInfo = {
            title: 'Info',
            type: 'info'
        }
        this.defaultWarn = {
            title: 'Warning',
            type: 'warn'
        }
    }

    async getPromise(url, args = {onSuccess: true, onError: true, onInfo: true, onWarn: true, async: true}){
        if( !args.async ){
            return await new Promise( (resolve, reject)=> {
                axios.get(url).then(response =>{
                    this.checkForRedirect(response)
                    resolve(response)
                }).catch( response => {
                    this.checkForRedirect(response)
                    reject(response)
                })
            })
        }
        else{
            return new Promise( (resolve, reject)=> {
                axios.get(url).then(response =>{
                    this.checkForRedirect(response)
                    resolve(response)
                }).catch( response => {
                    this.checkForRedirect(response)
                    reject(response)
                })
            })
        }
    }

    get(url, args = {onSuccess: true, onError: true, onInfo: true, onWarn: true}){
        let params = args.params || {};
        
        axios.get(url, params)
        .then(response => {
            this.checkForRedirect(response)
            if( response.data.success && args.onSuccess ){
                if( args.onSuccess.type == undefined ){
                    args.onSuccess.type = "success"
                }
                this.parseArgs(args.onSuccess, response)
                return
            }
            if( !response.data.success && args.onWarn ){
                if( args.onWarn.type == undefined ){
                    args.onWarn.type = "warn"
                }
                this.parseArgs(args.onWarn, response)
                return
            }
        }).catch(error => {
            this.checkForRedirect(error)
            console.log(error)
            if( args.onError ){
                if( args.onError.type == undefined ){
                    args.onError.type = "error"
                }
                this.parseArgs(args.onError, error)
            }
        })
        
    }
    post(url, args = {onSuccess: true, onError: true, onInfo: true, onWarn: true}){
        let params = args.params || {};
        let headers = {headers: args.headers || ""}
        
        axios.post(url, params, headers)
        .then(response => {
            this.checkForRedirect(response)
            if( response.data.success && args.onSuccess ){
                if( args.onSuccess.type == undefined ){
                    args.onSuccess.type = "success"
                }
                this.parseArgs(args.onSuccess, response)
            }
            if( !response.data.success && args.onWarn ){
                if( args.onWarn.type == undefined ){
                    args.onWarn.type = "warn"
                }
                this.parseArgs(args.onWarn, response)
                return
            }
        }).catch(error => {
            this.checkForRedirect(error)
            console.log(error)
            if( args.onError ){
                if( args.onError.type == undefined ){
                    args.onError.type = "error"
                }
                this.parseArgs(args.onError, error)
            }
        })
        
    }

    parseArgs(args, response){
        let callback = false
        if( args.callback ){
            callback = args.callback
            delete args.callback
        }
        let notifyArgs = args
        if( notifyArgs && !notifyArgs.silent ){
            Vue.notify(notifyArgs)
        }
        
        if( callback ){
            callback(response)
        }
    }

    checkForRedirect(response){
        if( response.response != undefined && response.response.data.message == "Unauthenticated." ){
            if( window.App.$router.currentRoute.path != "/" ){
                window.App.$store.state.auth.authMessage = "You've been logged on. Please log in again"
                window.App.$router.push({path: "/"})
            }
            
            return
        }
        if( response.data.details == "incorrect_permissions" || response.data.details == "incorrect_role" ){
            if( window.App.$router.currentRoute.path != "/" ){
                window.App.$store.state.auth.authMessage = window.App.$store.state.auth.authMessages[response.data.details]
                window.App.$router.push({path: "/"})
            }
            
            return
        }
    }
}

export default new Request()