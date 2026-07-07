import axios from "axios";
import { apiClient } from "../services/api-client";

async function test() {
  try {
    // 1. Login
    const loginRes = await axios.post(
      "http://localhost:4000/api/v1/auth/login",
      { email: "admin@gurk.com", password: "Admin123!" },
      { headers: { "Content-Type": "application/json" } },
    );
    console.log("=== LOGIN: raw response.data ===");
    console.log(JSON.stringify(loginRes.data, null, 2));

    const token = loginRes.data.accessToken;
    if (!token) {
      console.log("NO TOKEN — login may have failed or different shape");
      return;
    }

    // 2. Set token like the app does
    // We'll call directly with apiClient which has the interceptor
    // First, test WITHOUT the interceptor to see what the backend actually sends
    const rawClient = axios.create({
      baseURL: "http://localhost:4000/api/v1",
      withCredentials: true,
    });

    const rawRes = await rawClient.get("/companies", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("\n=== COMPANIES: RAW (no interceptor) ===");
    console.log(JSON.stringify(rawRes.data, null, 2));
    console.log("\nkeys:", Object.keys(rawRes.data));
    console.log("Has success?", "success" in rawRes.data);
    console.log("Has data?", "data" in rawRes.data);
    console.log("Has meta?", "meta" in rawRes.data);

    // Check what the data property contains
    if (rawRes.data && rawRes.data.data) {
      console.log("\nrawRes.data.data keys:", Object.keys(rawRes.data.data));
      console.log("rawRes.data.data.data:", JSON.stringify(rawRes.data.data.data, null, 2));
      console.log("rawRes.data.data.meta:", JSON.stringify(rawRes.data.data.meta, null, 2));
    }

    // 3. Simulate what the interceptor does:
    const intercepted = { ...rawRes.data };
    if (
      intercepted &&
      typeof intercepted === "object" &&
      "success" in intercepted &&
      "data" in intercepted
    ) {
      const afterInterceptor = intercepted.data;
      console.log("\n=== AFTER INTERCEPTOR (response.data = response.data.data) ===");
      console.log(JSON.stringify(afterInterceptor, null, 2));
      console.log("\nkeys:", Object.keys(afterInterceptor));
      console.log("Has 'data'?", "data" in afterInterceptor);
      console.log("Has 'meta'?", "meta" in afterInterceptor);
      
      // 4. Simulate what the service does: .then(res => res.data)
      // res is the AxiosResponse, res.data is what the interceptor set
      const afterServiceUnwrap = afterInterceptor;
      console.log("\n=== AFTER .then(res => res.data) ===");
      console.log(JSON.stringify(afterServiceUnwrap, null, 2));
    }

  } catch (err: any) {
    console.error("ERROR:", err.message);
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
    }
  }
}

test();
