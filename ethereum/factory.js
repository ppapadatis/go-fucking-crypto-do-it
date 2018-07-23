require('dotenv').config();

import web3 from './web3';
import TaskFactory from './build/TaskFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(TaskFactory.interface),
  process.env.FACTORY_CONTACT_ADDRESS
);

export default instance;
