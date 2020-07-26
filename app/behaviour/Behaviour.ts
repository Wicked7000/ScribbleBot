import Discord from 'discord.js';
import DiscordManager from '../DiscordManager';

type BehaviourType = 'dm' | 'text';
export type HandlerType = (manager: DiscordManager, message: Discord.Message) => void;
export type MatcherFunction = (message: Discord.Message) => boolean;

export default class Behaviour{
    private name: string;
    private type: BehaviourType;
    private matcher: MatcherFunction;
    private handler: HandlerType;

    constructor(name: string, type: BehaviourType, matcher: MatcherFunction, handler: HandlerType){
        this.name = name;
        this.type = type;
        this.matcher = matcher;
        this.handler = handler;
    }

    public getName(){
        return this.name;
    }

    public getMatcher(){
        return this.matcher;
    }

    public getHandler(){
        return this.handler;
    }

    public getType(){
        return this.type;
    }
}