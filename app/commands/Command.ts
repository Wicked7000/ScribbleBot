import Discord from 'discord.js';
import DiscordManager from '../DiscordManager';
import StateObject from '../state/StateObject';

export type HandlerType = (manager: DiscordManager, message: Discord.Message, stateObject: StateObject) => void;
export type MatcherFunction = (message: Discord.Message) => boolean;

export default class Command{
    private name: string;
    private description: string;
    private matcher: MatcherFunction;
    private handler: HandlerType;

    constructor(name: string, description: string, matcher: MatcherFunction, handler: HandlerType){
        this.name = name;
        this.description = description;
        this.matcher = matcher;
        this.handler = handler;
    }

    public getName(){
        return this.name;
    }

    public getDescription(){
        return this.description;
    }

    public getMatcher(){
        return this.matcher;
    }

    public getHandler(){
        return this.handler;
    }
}