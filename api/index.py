from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

profiles: dict[str, dict] = {}
achievements: list[dict] = []


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def public_profile(profile: dict) -> dict:
    return {
        "id": profile["id"],
        "name": profile["name"],
        "department": profile["department"],
        "grade": profile["grade"],
        "sns": profile["sns"] if profile.get("sns_public") else "",
        "sns_public": bool(profile.get("sns_public")),
        "created_at": profile["created_at"],
    }


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "service": "introduce-bingo"})


@app.get("/api/profiles")
def list_profiles():
    return jsonify([public_profile(profile) for profile in profiles.values()])


@app.post("/api/profiles")
def create_profile():
    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", "")).strip()
    if not name:
        return jsonify({"error": "name is required"}), 400

    profile_id = str(payload.get("id") or uuid4())
    profile = {
        "id": profile_id,
        "name": name[:40],
        "department": str(payload.get("department", "")).strip()[:60],
        "grade": str(payload.get("grade", "")).strip()[:20],
        "sns": str(payload.get("sns", "")).strip()[:80],
        "sns_public": bool(payload.get("sns_public", False)),
        "created_at": payload.get("created_at") or now_iso(),
    }
    profiles[profile_id] = profile
    return jsonify(public_profile(profile)), 201


@app.get("/api/achievements")
def list_achievements():
    return jsonify(achievements)


@app.post("/api/achievements")
def create_achievement():
    payload = request.get_json(silent=True) or {}
    owner_id = str(payload.get("owner_id", "")).strip()
    partner_id = str(payload.get("partner_id", "")).strip()
    square = str(payload.get("square", "")).strip()

    if not owner_id or not partner_id or not square:
        return jsonify({"error": "owner_id, partner_id and square are required"}), 400

    achievement = {
        "id": str(uuid4()),
        "owner_id": owner_id,
        "partner_id": partner_id,
        "square": square[:80],
        "created_at": now_iso(),
    }
    achievements.append(achievement)
    return jsonify(achievement), 201


@app.get("/api/ranking")
def ranking():
    counts: dict[str, int] = {}
    for achievement in achievements:
        counts[achievement["owner_id"]] = counts.get(achievement["owner_id"], 0) + 1

    rows = []
    for profile_id, count in counts.items():
        profile = profiles.get(profile_id)
        if profile:
            rows.append({"profile": public_profile(profile), "bingo_count": count})

    rows.sort(key=lambda row: row["bingo_count"], reverse=True)
    return jsonify(rows)


if __name__ == "__main__":
    app.run(debug=True, port=5050)
