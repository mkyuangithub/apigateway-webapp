import Request from "@/toolkit/request.js";
import Authorization from "@/toolkit/authorization.js";
class RouteApi extends Request {

    async searchRoutes(payload) {
        return this.get("/api/admin/route/searchRoutes", payload);
    }

    async createRoute(payload) {
        return this.post("/api/admin/route/create", payload);
    }
    async updateRoute(payload) {
        return this.post("/api/admin/route/update", payload);
    }

    async getRouteById(payload) {
        return this.get("/api/admin/route/getRouteById", payload);
    }

    async delete(payload) {
        return this.post("/api/admin/route/delete", payload);
    }
}

export default new RouteApi("/venus");