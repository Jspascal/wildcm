import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from "pactum";
import { AuthDto } from "../src/auth/dto";
import { EditUserDto } from "../src/user/dto/edit-user.dto";

describe("App e2e", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl("http://localhost:3333");
    pactum.request.setDefaultTimeout(500000);
  });
  afterAll(() => {
    app.close();
  });
  describe("Auth", () => {
    const dto: AuthDto = {
      email: "fulgaros@gmail.com",
      password: "password",
    };
    describe("Signup", () => {
      it("Proceed signup", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody(dto)
          .expectStatus(201);
      });
      it("Throw if email empty", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it("Throw if password empty", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it("Throw if no body", () => {
        return pactum.spec().post("/auth/signup").expectStatus(400);
      });
    });

    describe("Signin", () => {
      it("proceed signin", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody(dto)
          .expectStatus(200)
          .stores("userAt", "access_token");
      });
      it("Throw if email empty", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it("Throw if password empty", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it("Throw if no body", () => {
        return pactum.spec().post("/auth/signin").expectStatus(400);
      });
    });
  });
  describe("User", () => {
    describe("Get me", () => {
      it("fetching current user infos", () => {
        return pactum
          .spec()
          .get("/users/me")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(200)
          .inspect();
      });
    });

    describe("User Edit", () => {
      it("edit the current user infos", () => {
        const dto: EditUserDto = {
          firstName: "Joseph",
          email: "fulgaros@gmail.com",
        };
        return pactum
          .spec()
          .patch("/users")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .withBody(dto)
          .expectStatus(200)
          .inspect();
      });
    });
  });
  describe("Bookmark", () => {
    describe("Create Bookmark", () => { });

    describe("Get bookmarks", () => { });

    describe("Get bookmark by Id", () => { });

    describe("Edit Bookmark", () => { });

    describe("Delete Bookmark", () => { });
  });
});
