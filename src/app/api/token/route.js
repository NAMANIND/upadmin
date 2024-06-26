import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const accessToken = await getAccessToken();
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error("Error getting access token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getAccessToken() {
  const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];
  return new Promise(function (resolve, reject) {
    const key = require("../../../../assent-connect-plus-3014e-firebase-adminsdk-3r9u6-9174bda4f9.json");
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    );
    jwtClient.authorize(function (err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
}
