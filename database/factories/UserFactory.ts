import User from 'App/Models/User'
import Factory from '@ioc:Adonis/Lucid/Factory'
import Hash from '@ioc:Adonis/Core/Hash'

export default Factory.define(User, async ({faker}) => {
  return {
    name: faker.person.firstName(),
    email: faker.internet.email(),
    password: await Hash.make(faker.internet.password()),
  }
}).build()
