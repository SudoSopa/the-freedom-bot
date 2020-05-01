import { Message } from 'discord.js'
import { Command } from '../../entity/Command'
import { User } from '../../entity/User'
import { GuildMember } from 'discord.js'
import AbstractDayHandler from '../abstract/AbstractDayHandler'
import { Report } from '../../entity/Report'
import { getLastSetDay } from '../../util/db'

export default class RegressionHandler extends AbstractDayHandler {
    public constructor() {
        super(true, false, false)
    }

    protected async rerank(
        discordUser: GuildMember,
        prevPoints: number,
        newPoints: number
    ): Promise<void> {
        // TODO: Write a custom handler for this!
        super.rerank(discordUser, prevPoints, newPoints)
    }

    protected async handler(user: User, cmd: Command, msg: Message): Promise<any> {
        const lastSetDay = await getLastSetDay(user)
        const lastDay = lastSetDay.day

        const existingPoints = user.points
        const pointsToRemove = Math.floor(existingPoints / 2)

        await Report.create({
            user,
            command: cmd,
            isRegression: true,
            day: 0,
            points: -pointsToRemove
        }).save()

        user.points = user.points - pointsToRemove
        await user.save()

        await this.rerankStreaks(msg.member, lastDay, 0)
        // TODO(N): Show them something inspirational.
        // Probably want to make a module that will fetch a URL from the NoFap website. Take a peek
        // at Emergency.ts to see how we do it.
        // TODO: Write a message formatter that deals with formatting floating points/embeds.
        return msg.reply(
            `your relapse has been recorded. You lost ${pointsToRemove} points and now have ${user.points.toFixed(
                2
            )}.`
        )
    }
}
