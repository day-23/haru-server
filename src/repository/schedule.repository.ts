import { InjectRepository } from "@nestjs/typeorm";
import { Schedule } from "src/entity/schedule.entity";
import { Repository } from "typeorm";

export class ScheduleRepository {
    constructor(@InjectRepository(Schedule) private readonly repository: Repository<Schedule>,
    ) { }
}
