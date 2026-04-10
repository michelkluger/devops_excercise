"""MeiliSearch integration for full-text VM search."""

import contextlib
import logging
import os
from typing import Any

import meilisearch
import meilisearch.errors
from requests.exceptions import ConnectionError as RequestsConnectionError

from app.schemas import VMFilterParams

logger = logging.getLogger(__name__)

MEILI_URL = os.environ.get("MEILI_URL", "http://localhost:7701")
INDEX_NAME = "vms"


class _ClientHolder:
    """Lazy singleton for the MeiliSearch client."""

    instance: meilisearch.Client | None = None


def get_client() -> meilisearch.Client:
    """Return a cached MeiliSearch client instance."""
    if _ClientHolder.instance is None:
        _ClientHolder.instance = meilisearch.Client(MEILI_URL)
    return _ClientHolder.instance


def setup_index() -> None:
    """Create and configure the VMs search index."""
    client = get_client()
    with contextlib.suppress(meilisearch.errors.MeilisearchApiError):
        client.create_index(INDEX_NAME, {"primaryKey": "id"})

    index = client.index(INDEX_NAME)
    index.update_filterable_attributes(["network", "status", "os"])
    index.update_sortable_attributes(["name", "cpu", "ram", "disk", "created_at"])
    index.update_searchable_attributes(["name", "os", "network", "status"])
    index.update_typo_tolerance(
        {
            "enabled": True,
            "minWordSizeForTypos": {"oneTypo": 4, "twoTypos": 8},
        }
    )
    index.update_ranking_rules(
        [
            "words",
            "typo",
            "proximity",
            "attribute",
            "sort",
            "exactness",
        ]
    )
    logger.info("MeiliSearch index '%s' configured", INDEX_NAME)


def index_vm(vm_dict: dict[str, Any]) -> None:
    """Add or update a VM document in the search index."""
    client = get_client()
    doc = {**vm_dict, "id": str(vm_dict["id"])}
    for key in ("created_at", "updated_at"):
        val = doc.get(key)
        if val is not None and hasattr(val, "isoformat"):
            doc[key] = str(val)
    client.index(INDEX_NAME).add_documents([doc])


def delete_vm_from_index(vm_id: str) -> None:
    """Remove a VM document from the search index."""
    client = get_client()
    client.index(INDEX_NAME).delete_document(vm_id)


def search_vms(
    query: str,
    filters: VMFilterParams,
    limit: int = 20,
    offset: int = 0,
) -> dict[str, Any]:
    """Execute a full-text search query against MeiliSearch."""
    client = get_client()
    index = client.index(INDEX_NAME)

    params: dict[str, Any] = {
        "limit": limit,
        "offset": offset,
    }

    facets = []
    if filters.network:
        facets.append(f'network = "{filters.network}"')
    if filters.status:
        facets.append(f'status = "{filters.status}"')
    if filters.os:
        facets.append(f'os = "{filters.os}"')
    if facets:
        params["filter"] = " AND ".join(facets)

    if filters.sort_by:
        params["sort"] = [f"{filters.sort_by}:{filters.order}"]

    return index.search(query, params)


def autocomplete(query: str, limit: int = 5) -> list[dict[str, str]]:
    """Return lightweight name+id suggestions for autocomplete."""
    client = get_client()
    index = client.index(INDEX_NAME)
    results = index.search(
        query,
        {
            "limit": limit,
            "attributesToRetrieve": ["id", "name", "network", "status"],
        },
    )
    return results["hits"]


def is_available() -> bool:
    """Check whether MeiliSearch is reachable."""
    try:
        client = get_client()
        client.health()
    except (meilisearch.errors.MeilisearchError, RequestsConnectionError, OSError):
        return False
    else:
        return True
