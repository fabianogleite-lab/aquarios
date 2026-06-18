import hashlib, time

class MockLedger:
    def __init__(self):
        self.balances = {"test_user": 100.0, "cerebro": 0.0, "subagente": 0.0}
    def get_balance(self, account: str) -> float:
        return self.balances.get(account, 0.0)
    def send_tkn(self, source: str, dest: str, amount: float, content_hash: str) -> str:
        if self.balances.get(source, 0.0) < amount: raise ValueError("Saldo insuficiente")
        self.balances[source] -= amount
        self.balances[dest] = self.balances.get(dest, 0.0) + amount
        raw = f"{source}{dest}{amount}{content_hash}{time.time()}"
        return hashlib.sha256(raw.encode()).hexdigest()
