import Request from "@/toolkit/request.js";
import Authorization from "@/toolkit/authorization.js";
class RouteApi extends Request {

    async searchRoutes(payload) {
        return this.get("/api/admin/route/searchRoutes", payload);
    }
}

export default new RouteApi("/venus");