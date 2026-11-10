
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from "@nestjs/common";
import { BusinessesService } from "./businesses.service.js";

@Controller("businesses")
export class BusinessesController {
  constructor(
    private readonly businessesService: BusinessesService,
  ) {}

  @Get()
  findAll() {
    return this.businessesService.findAll();
  }

  @Get(":id")
  async findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
  ) {
    const business = await this.businessesService.findOne(id);

    if (!business) {
      throw new NotFoundException(
        "El establecimiento solicitado no existe.",
      );
    }

    return business;
  }
}
