@router.post("/compare")
def compare():
    return compare_contracts(None, None)