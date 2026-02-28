"""Geocode addresses using OpenStreetMap Nominatim API."""

import json
import logging
import urllib.request
import urllib.parse

logger = logging.getLogger(__name__)


def geocode_address(address: str) -> tuple[float, float] | None:
    """
    Geocode an address string using the Nominatim API.

    Returns (latitude, longitude) tuple or None if geocoding fails.
    """
    encoded = urllib.parse.urlencode({"q": address, "format": "json", "limit": "1"})
    url = f"https://nominatim.openstreetmap.org/search?{encoded}"

    req = urllib.request.Request(url, headers={"User-Agent": "DoCiebie/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
    except Exception:
        logger.exception("Geocoding request failed for address: %s", address)
        return None

    if not data:
        logger.warning("No geocoding results for address: %s", address)
        return None

    return float(data[0]["lat"]), float(data[0]["lon"])
