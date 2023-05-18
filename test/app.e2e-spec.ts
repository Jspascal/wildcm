import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from "pactum";
import { AuthDto } from "../src/auth/dto";
import { EditUserDto } from "../src/user/dto/edit-user.dto";
import { CreateBookmarkDto } from "../src/bookmark/dto/create-bookmark.dto";

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
    // pactum.request.setDefaultTimeout(500000);
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
    describe("Get empty Bookmark", () => {
      it("should return empty bookmarks list", () => {
        return pactum
          .spec()
          .get("/bookmarks")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(200)
          .inspect()
          .expectBody([]);
      });
    });

    describe("Create Bookmark", () => {
      const dto: CreateBookmarkDto = {
        title: "Amazing bookmark",
        description: "Take a look at my so beautiful bookmark",
        link: "https://mybookmark.com",
      };
      it("should create one bookmark", () => {
        return pactum
          .spec()
          .post("/bookmarks")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .withBody(dto)
          .expectStatus(201)
          .stores("bookmarkId", "id");
      });
    });

    describe("Get bookmarks", () => {
      it("should return bookmarks list", () => {
        return pactum
          .spec()
          .get("/bookmarks")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(200)
          .inspect()
          .expectJsonLength(1);
      });
    });

    describe("Get bookmark by Id", () => {
      it("should return bookmark details", () => {
        return pactum
          .spec()
          .get("/bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(200)
          .expectBodyContains("$S{bookmarkId}")
          .inspect();
      });
    });

    describe("Edit Bookmark", () => {
      const dto: CreateBookmarkDto = {
        title: "Amazing modified bookmark",
        description: "Take a look at my modified so beautiful bookmark",
        link: "https://modifiedbookmark.com",
      };
      it("should edit bookmark details", () => {
        return pactum
          .spec()
          .patch("/bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .withBody(dto)
          .expectStatus(200)
          .inspect();
      });
    });

    describe("Delete Bookmark", () => {
      it("should delete bookmark", () => {
        return pactum
          .spec()
          .delete("/bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(204);
      });
      it("should get empty bookmarks", () => {
        return pactum
          .spec()
          .get("/bookmarks")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(200)
          .inspect()
          .expectJsonLength(0);
      });
    });
  });
});
