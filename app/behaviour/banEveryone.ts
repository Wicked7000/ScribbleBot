import DiscordManager from '../DiscordManager';
import { Message } from 'discord.js';
import { STATELESS_COMMAND, END_OF_CONVERSATION } from '../state/StateManager';
import Behaviour, { HandlerType, MatcherFunction } from './Behaviour';

const handlerBanEveryone: HandlerType = async (manager: DiscordManager, message: Message) => {
    message.delete();
    message.reply('Please do not use \`@everyone\`!');
}

const testFn: MatcherFunction = (message: Message) => {
    return /.*@everyone.*/.test(message.content);
}

const banEveryone = new Behaviour('ban @everyone', 'text', testFn, handlerBanEveryone);
export default banEveryone;