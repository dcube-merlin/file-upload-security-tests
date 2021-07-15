import * as request from "supertest";
import { FileFormats } from "../../src/file-upload/magic-byte";

const SERVER : string = process.env.URL || "";

describe("POST /api/upload", () => {
	it("should return 200 SUCCESS when correct data is received with proper security headers", async () => {
		const cookie = await (await request(SERVER).get("/api/user/dummy/S1234567A")).header['set-cookie'];

		let res, body;
    res = await request(SERVER)
      .post("/api/upload")
      .set("Cookie", cookie)
      .set("X-CSRF-Token", cookie["X-CSRF-Token"])
      .send({
        fileName: "sample.jpeg",
        contentType: FileFormats.JPEG,
        file: "/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAK/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgAAQABAwERAAIRAQMRAf/EABQAAQAAAAAAAAAAAAAAAAAAAAT/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAABv/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ACDhA//Z"
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe("image/jpeg");
    expect(res.headers['x-content-type-options']).toBe("nosniff");
    if (res.text) body = JSON.parse(res.text);
    expect(body.data.secure).toBe(true);
	});

  it("should return 405 METHOD NOT ALLOWED when incorrect API method type is received", async () => {
		let res, body;
    res = await request(SERVER)
      .get("/api/upload");
    
    expect(res.statusCode).toBe(405);
    if (res.text) body = JSON.parse(res.text);
    expect(body.data.errors).toBeDefined();
    expect(body.data.errors.message).toBe("Invalid Request");
	});

  it("should return 405 METHOD NOT ALLOWED when incorrect API method type is received", async () => {
		const cookie = await (await request(SERVER).get("/api/user/dummy/S1234567A")).header['set-cookie'];

		let res, body;
    res = await request(SERVER)
      .delete("/api/upload")
      .set("Cookie", cookie)
      .set("X-CSRF-Token", cookie["X-CSRF-Token"]);
    
    expect(res.statusCode).toBe(405);
    if (res.text) body = JSON.parse(res.text);
    expect(body.data.errors).toBeDefined();
    expect(body.data.errors.message).toBe("Invalid Request");
	});

  it("should return 400 BAD REQUEST when incorrect data is received", async () => {
		const cookie = await (await request(SERVER).get("/api/user/dummy/S1234567A")).header['set-cookie'];

		let res, body;
    res = await request(SERVER)
      .post("/api/upload")
      .set("Cookie", cookie)
      .set("X-CSRF-Token", cookie["X-CSRF-Token"])
      .send({
        fileName: "sample.jpeg",
        contentType: FileFormats.JPEG,
        file: "agaegfaiofhiaeogaegaegae"
      });
    
    expect(res.statusCode).toBe(400);
    if (res.text) body = JSON.parse(res.text);
    expect(body.data.secure).toBe(false);
	});

  it("should return 401 UNAUTHORIZED when incorrect cookie data is set in request", async () => {
		const cookie = await (await request(SERVER).get("/api/user/dummy/S1234567A")).header['set-cookie'];

		let res, body;
    res = await request(SERVER)
      .post("/api/upload")
      .set("Cookie", "abefuaefoiaeoifea")
      .set("X-CSRF-Token", cookie["X-CSRF-Token"])
      .send({
        fileName: "sample.jpeg",
        contentType: FileFormats.JPEG,
        file: "agaegfaiofhiaeogaegaegae"
      });
    
    expect(res.statusCode).toBe(401);
    if (res.text) body = JSON.parse(res.text);
    expect(body.data).toBe('UNAUTHORIZED');
	});

  it("should return 401 UNAUTHORIZED when invalid auth header is received", async () => {
		let cookie = await (await request(SERVER).get("/api/user/dummy/S1234567A")).header['set-cookie'];
    cookie['X-CSRF-TOKEN'] = "invalid";

		let res, body;
    res = await request(SERVER)
      .post("/api/upload")
      .set("Cookie", cookie)
      .set("X-CSRF-Token", cookie["X-CSRF-Token"])
      .send({
        fileName: "sample.jpeg",
        contentType: FileFormats.JPEG,
        file: "agaegfaiofhiaeogaegaegae"
      });
    
    expect(res.statusCode).toBe(401);
    if (res.text) body = JSON.parse(res.text);
    expect(body.data).toBe('UNAUTHORIZED');
	});

  it("should return 400 BAD REQUEST when empty request data is received", async () => {
		const cookie = await (await request(SERVER).get("/api/user/dummy/S1234567A")).header['set-cookie'];

		let res, body;
    res = await request(SERVER)
      .post("/api/upload")
      .set("Cookie", cookie)
      .send({ });
    
    expect(res.statusCode).toBe(400);
    if (res.text) body = JSON.parse(res.text);
    expect(body.data).toBe(false);
	});

  it("should return 400 BAD REQUEST when incorrect fileName data is received", async () => {
		const cookie = await (await request(SERVER).get("/api/user/dummy/S1234567A")).header['set-cookie'];

		let res, body;
    res = await request(SERVER)
      .post("/api/upload")
      .set("Cookie", cookie)
      .send({ 
        fileName: "\([A-Z][a-z][0-9])+\g",
        contentType: FileFormats.JPEG,
        file: "/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAK/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgAAQABAwERAAIRAQMRAf/EABQAAQAAAAAAAAAAAAAAAAAAAAT/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAABv/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ACDhA//Z"
      });
    
    expect(res.statusCode).toBe(400);
    if (res.text) body = JSON.parse(res.text);
    expect(body.data.errors).toBeDefined();
    expect(body.data.errors.message).toBe("Errors found when validating Schema");
	});

  it("should return 400 BAD REQUEST when incorrect contentType data is received", async () => {
		const cookie = await (await request(SERVER).get("/api/user/dummy/S1234567A")).header['set-cookie'];

		let res, body;
    res = await request(SERVER)
      .post("/api/upload")
      .set("Cookie", cookie)
      .send({ 
        fileName: "sample.jpeg",
        contentType: "application/json",
        file: "/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAK/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgAAQABAwERAAIRAQMRAf/EABQAAQAAAAAAAAAAAAAAAAAAAAT/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAABv/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/ACDhA//Z"
      });
    
    expect(res.statusCode).toBe(400);
    if (res.text) body = JSON.parse(res.text);
    expect(body.data.errors).toBeDefined();
    expect(body.data.errors.message).toBe("Errors found when validating Schema");
	});

  it("should return 400 BAD REQUEST when incorrect file data is received", async () => {
		const cookie = await (await request(SERVER).get("/api/user/dummy/S1234567A")).header['set-cookie'];

		let res, body;
    res = await request(SERVER)
      .post("/api/upload")
      .set("Cookie", cookie)
      .send({ 
        fileName: "sample.jpeg",
        contentType: FileFormats.JPEG,
        file: 189231230129901241902180248102410249091230412931023
      });
    
    expect(res.statusCode).toBe(400);
    if (res.text) body = JSON.parse(res.text);
    expect(body.data.errors).toBeDefined();
    expect(body.data.errors.message).toBe("Errors found when validating Schema");
	});

  it("should return 400 BAD REQUEST when double-padded extension file is received", async () => {
		const cookie = await (await request(SERVER).get("/api/user/dummy/S1234567A")).header['set-cookie'];

		let res, body;
    res = await request(SERVER)
      .post("/api/upload")
      .set("Cookie", cookie)
      .send({ 
        fileName: "sample.php.jpeg",
        contentType: FileFormats.JPEG,
        file: "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
      });
    
    expect(res.statusCode).toBe(400);
    if (res.text) body = JSON.parse(res.text);
    expect(body.data.errors).toBeDefined();
    expect(body.data.errors.message).toBe("Errors found when validating Schema");
	});

  it("should return 400 BAD REQUEST when file with invalid character in fileName is received", async () => {
		const cookie = await (await request(SERVER).get("/api/user/dummy/S1234567A")).header['set-cookie'];

		let res, body;
    res = await request(SERVER)
      .post("/api/upload")
      .set("Cookie", cookie)
      .send({ 
        fileName: "test.php%00.jpeg",
        contentType: FileFormats.JPEG,
        file: "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
      });
    
    expect(res.statusCode).toBe(400);
    if (res.text) body = JSON.parse(res.text);
    expect(body.data.errors).toBeDefined();
    expect(body.data.errors.message).toBe("Errors found when validating Schema");
	});

  it("should return 400 BAD REQUEST when exceedingly long filename is received", async () => {
		const cookie = await (await request(SERVER).get("/api/user/dummy/S1234567A")).header['set-cookie'];

		let res, body;
    res = await request(SERVER)
      .post("/api/upload")
      .set("Cookie", cookie)
      .send({ 
        fileName: "aefianfaenfioaenfionaieofoeajifoajeifjaiejfioaejieojfisgrsjnseifeijfiejfijeijiejfiejfikeifkfaejifiaevioaejvioaseiovjaeiojvaevioaejvioaseiovjaeiojvaevioaejvioaseiovjaeiojvaevioaejvioaseiovjaeiojvaevioaejvioaseiovjaeiojvaevioaejvioaseiovjaeiojvaevioaejvioaseiovjaeiojv.jpeg",
        contentType: FileFormats.JPEG,
        file: "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
      });
    
    expect(res.statusCode).toBe(400);
    if (res.text) body = JSON.parse(res.text);
    expect(body.data.errors).toBeDefined();
    expect(body.data.errors.message).toBe("Errors found when validating Schema");
	});

  it("should return 400 BAD REQUEST when file of size >1MB is received", async () => {
		const cookie = await (await request(SERVER).get("/api/user/dummy/S1234567A")).header['set-cookie'];

		let res, body;
    res = await request(SERVER)
      .post("/api/upload")
      .set("Cookie", cookie)
      .send({ 
        fileName: "sample.jpeg",
        contentType: FileFormats.JPEG,
        file: hugeFileBase64
      });
    
    expect(res.statusCode).toBe(400);
    if (res.text) body = JSON.parse(res.text);
    expect(body.data.errors).toBeDefined();
    expect(body.data.errors.message).toBe("Errors found when validating Schema");
	});

  it("should return 400 BAD REQUEST when a JPEG file with invalid file signature is received", async () => {
		const cookie = await (await request(SERVER).get("/api/user/dummy/S1234567A")).header['set-cookie'];

		let res, body;
    res = await request(SERVER)
      .post("/api/upload")
      .set("Cookie", cookie)
      .send({ 
        fileName: "sample.jpeg",
        contentType: FileFormats.JPEG,
        file: "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALFJREFUeNpjsLGxxUSWllZWVtZABgOmnLW1jbm5GRDY2NgxYOiz1NfXmT59W03NZA0NZRRpc3NzW1v77OyapqZZaWllenraDMhyQGOrqiasXn0xNDReV1cTqJQBLgcElZX9K1eeS0rKNzTUh4gzQNwJdMjEieu2bLkbH58DtBtuJAPQQCMjg5qaScuWnUpMzEOWA0kDnQr0QHl5j79/ONxMhDQQ29ra6ehoGBjoAhlo0gBaLFRood8sewAAAABJRU5ErkJggg=="
      });
    
    expect(res.statusCode).toBe(400);
    if (res.text) body = JSON.parse(res.text);
    expect(body.data.errors).toBeDefined();
    expect(body.data.errors.message).toBe("Errors found when validating Schema");
	});
});

//Base64 string of file size >1MB