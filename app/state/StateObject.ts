import { PossibleStates } from "./StateManager";
import Command, { HandlerType } from "../commands/Command";
import { clearTimeout } from "timers";
import { User } from "discord.js";
import Behaviour from "../behaviour/Behaviour";

export default class StateObject{    
    private readonly user: User;
    private readonly nextHandler?: HandlerType;
    private readonly timeoutId?: NodeJS.Timeout;
    private readonly command: Command;
    private stateType: PossibleStates;
    private currentState: any;
    
    constructor(user: User, command: Command, stateType: PossibleStates, timeoutId?: NodeJS.Timeout, nextHandler?: HandlerType){
        this.user = user;
        this.command = command;
        this.stateType = stateType;
        this.nextHandler = nextHandler;
        this.timeoutId = timeoutId;
        this.currentState = {};
    }
    public sendMessageToUser(content: string) {
        this.user.dmChannel.send(content);
    }

    public getStateType(){
        return this.stateType;
    }

    public getNextHandler(){
        return this.nextHandler;
    }

    public cancelTimeout(){
        if(this.timeoutId){
            clearTimeout(this.timeoutId);
        }        
 
    }

    public getCommand(): Command{
        return this.command;
    }

    public getState(): Readonly<any> {
        return this.currentState;
    }

    public updateStateType(newType: PossibleStates){
        this.stateType = newType;
    }

    public updateState(newState: any){
        this.currentState = newState;
    }
}