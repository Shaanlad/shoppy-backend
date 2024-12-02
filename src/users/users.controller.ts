import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import { UsersService } from './users.service';
import { FileInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { TokenPayload } from 'src/auth/token-payload.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { USER_IMAGES } from './user-images';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(NoFilesInterceptor())
  createUser(@Body() request: CreateUserRequest) {
    return this.usersService.createUser(request);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: TokenPayload) {
    return user;
  }

  @Post(':userId/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: USER_IMAGES,
        filename: (req, file, callback) => {
          callback(null, `${req.params.userId}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadUserImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          //   new MaxFileSizeValidator({ maxSize: 50000000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    _file: Express.Multer.File,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('userId') userId: string) {
    return this.usersService.getUserById(+userId);
  }
}
