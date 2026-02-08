"""
Local file-based storage implementation for credentials and settings.
This provides a fallback when Azure Table Storage is not configured.
"""
import json
import os
from typing import Union, Dict, Tuple
import datetime
import threading

class LocalFileStorage:
    """Thread-safe local file-based storage."""
    
    def __init__(self, filename: str):
        self.filename = filename
        self.lock = threading.Lock()
        self._ensure_file_exists()
    
    def _ensure_file_exists(self):
        """Ensure the storage file exists."""
        if not os.path.exists(self.filename):
            with self.lock:
                os.makedirs(os.path.dirname(self.filename), exist_ok=True)
                with open(self.filename, 'w') as f:
                    json.dump({}, f)
    
    def read(self) -> Dict:
        """Read data from the storage file."""
        with self.lock:
            try:
                with open(self.filename, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                return {}
    
    def write(self, data: Dict):
        """Write data to the storage file."""
        with self.lock:
            with open(self.filename, 'w') as f:
                json.dump(data, f, indent=2, default=str)


class LocalCredentials:
    """Local file-based credentials storage."""
    
    def __init__(self, tenantName: str = "Default"):
        storage_dir = os.getenv("HACKBOX_LOCAL_STORAGE_DIR", "/tmp/hackbox_data")
        self._storage = LocalFileStorage(os.path.join(storage_dir, "credentials.json"))
        self._tenantName = str(tenantName).strip()
        if self._tenantName == "":
            self._tenantName = "Default"
    
    def sanitizeName(self, key: str) -> str:
        return "".join([c for c in key if c.isalnum() or c == "_" or c == "-" or c == " "]).strip()
    
    def sanitizeGroup(self, group: str) -> str:
        return "".join([c for c in group if c.isalnum() or c == "_" or c == "-"]).strip()
    
    def add(self, name: str, credential: str, group: str = "Default"):
        """Add or update a credential."""
        name = self.sanitizeName(name)
        group = self.sanitizeGroup(group)
        
        data = self._storage.read()
        if self._tenantName not in data:
            data[self._tenantName] = {}
        
        key = f"{group}|{name}"
        data[self._tenantName][key] = {
            "group": group,
            "name": name,
            "Credential": credential
        }
        
        self._storage.write(data)
        return self
    
    def get(self, name: str, group: str = "Default") -> Union[Dict[str, str], None]:
        """Get a specific credential."""
        name = self.sanitizeName(name)
        group = self.sanitizeGroup(group)
        
        data = self._storage.read()
        if self._tenantName not in data:
            return None
        
        key = f"{group}|{name}"
        return data[self._tenantName].get(key)
    
    def getGroup(self, group: str = "Default") -> Dict[str, Dict[str, str]]:
        """Get all credentials in a group."""
        group = self.sanitizeGroup(group)
        
        data = self._storage.read()
        if self._tenantName not in data:
            return {}
        
        entities = {}
        for key, entity in data[self._tenantName].items():
            if entity.get("group") == group:
                entities[entity["name"]] = entity
        
        return entities
    
    def getAll(self) -> list:
        """Get all credentials for the tenant."""
        data = self._storage.read()
        if self._tenantName not in data:
            return []
        
        return list(data[self._tenantName].values())


class LocalSettings:
    """Local file-based settings storage."""
    
    def __init__(self, tenantName: str = "Default"):
        storage_dir = os.getenv("HACKBOX_LOCAL_STORAGE_DIR", "/tmp/hackbox_data")
        self._storage = LocalFileStorage(os.path.join(storage_dir, "settings.json"))
        self._tenantName = str(tenantName).strip()
        self._tenantName = "".join([c for c in self._tenantName if c.isalnum() or c == "_" or c == "-"]).strip()
        if self._tenantName == "":
            self._tenantName = "Default"
    
    def sanitizeKey(self, key: str) -> str:
        return "".join([c for c in key if c.isalnum() or c == "_" or c == "-" or c == " "]).strip()
    
    def sanitizeGroup(self, group: str) -> str:
        return "".join([c for c in group if c.isalnum() or c == "_" or c == "-"]).strip()
    
    def set(self, key: str, value: Dict, group: str = "Default"):
        """Set a setting value."""
        key = self.sanitizeKey(key)
        group = self.sanitizeGroup(group)
        
        data = self._storage.read()
        if self._tenantName not in data:
            data[self._tenantName] = {}
        
        storage_key = f"{group}|{key}"
        value["key"] = key
        value["group"] = group
        data[self._tenantName][storage_key] = value
        
        self._storage.write(data)
        return self
    
    def get(self, key: str, group: str = "Default") -> Union[Dict, None]:
        """Get a setting value."""
        key = self.sanitizeKey(key)
        group = self.sanitizeGroup(group)
        
        data = self._storage.read()
        if self._tenantName not in data:
            return None
        
        storage_key = f"{group}|{key}"
        return data[self._tenantName].get(storage_key)
    
    def getGroup(self, group: str = "Default") -> Dict:
        """Get all settings in a group."""
        group = self.sanitizeGroup(group)
        
        data = self._storage.read()
        if self._tenantName not in data:
            return {}
        
        entities = {}
        for key, entity in data[self._tenantName].items():
            if entity.get("group") == group:
                entities[entity["key"]] = entity
        
        return entities
    
    def getAllTenantSettings(self, group: str = "Default") -> Dict[str, Dict]:
        """Get settings for all tenants in a group."""
        group = self.sanitizeGroup(group)
        
        data = self._storage.read()
        result = {}
        
        for tenant_name in data.keys():
            result[tenant_name] = {}
            for key, entity in data[tenant_name].items():
                if entity.get("group") == group:
                    result[tenant_name][entity["key"]] = entity
        
        return result
    
    def getAllDefaultTenantSettings(self) -> Dict:
        """Get all default settings for all tenants."""
        return self.getAllTenantSettings("Default")
    
    def setStep(self, step: int):
        """Set the current step/challenge."""
        self.set("CurrentStep", {"Step": step})
    
    def getStep(self) -> int:
        """Get the current step/challenge."""
        step_data = self.get("CurrentStep")
        if step_data is None or "Step" not in step_data:
            return 1
        return step_data["Step"]
    
    def setStopwatch(self, status: str, startTime: Union[datetime.datetime, str, None], secondsElapsed: int):
        """Set stopwatch state."""
        if status not in ["running", "stopped"]:
            raise ValueError("status must be 'running' or 'stopped'")
        
        if startTime is None:
            startTime = ""
        elif isinstance(startTime, datetime.datetime):
            startTime = startTime.isoformat()
        elif isinstance(startTime, str):
            try:
                datetime.datetime.fromisoformat(startTime)
            except Exception:
                raise ValueError("startTime must be a datetime object or an ISO 8601 string")
        else:
            raise ValueError("startTime must be a datetime object or an ISO 8601 string")
        
        if secondsElapsed < 0:
            secondsElapsed = 0
        else:
            secondsElapsed = int(secondsElapsed)
        
        self.set("Stopwatch", {
            "status": status,
            "startTime": startTime,
            "secondsElapsed": secondsElapsed
        })
        return self
    
    def getStopwatch(self) -> Tuple[str, Union[datetime.datetime, None], int]:
        """Get stopwatch state."""
        ti = self.get("Stopwatch")
        
        status = "stopped"
        startTime = None
        secondsElapsed = 0
        
        if ti is not None:
            if "status" in ti:
                status = ti["status"]
            if "startTime" in ti:
                startTime = ti["startTime"]
            if "secondsElapsed" in ti:
                secondsElapsed = ti["secondsElapsed"]
        
        if startTime is not None and startTime != "":
            try:
                startTime = datetime.datetime.fromisoformat(startTime)
            except Exception:
                startTime = None
        else:
            startTime = None
        
        return status, startTime, secondsElapsed
    
    def setPropagatedStep(self, step: Union[int, str], challenges_mds: list):
        """Set step with propagation logic (stopwatch, timing, etc.)."""
            
        reset_triggered = False
        previous_step = self.getStep()
        
        if isinstance(step, str):
            if str(step).lower().strip() == "decrease":
                step = previous_step - 1
            elif str(step).lower().strip() == "increase":
                step = previous_step + 1
            elif str(step).lower().strip() == "first":
                step = 1
                reset_triggered = True
            elif str(step).lower().strip() == "last":
                step = len(challenges_mds) + 1
        
        step = int(step)
        self.setStep(step)
        
        # Log challenge time for previous step
        try:
            if reset_triggered:
                self.set("ChallengeCompletionSeconds", {}, group="Statistics")
            elif previous_step <= len(challenges_mds):
                if step > previous_step:
                    status, startTime, secondsElapsed = self.getStopwatch()
                    if status == "running" and startTime is not None:
                        secondsElapsed = (datetime.datetime.now(datetime.timezone.utc) - startTime).total_seconds()
                        challengeTimes = self.get("ChallengeCompletionSeconds", group="Statistics")
                        if challengeTimes is None:
                            challengeTimes = {}
                        challengeTimes[f"Challenge{previous_step:03d}"] = float(secondsElapsed)
                        self.set("ChallengeCompletionSeconds", challengeTimes, group="Statistics")
                else:
                    challengeTimes = self.get("ChallengeCompletionSeconds", group="Statistics")
                    if challengeTimes and f"Challenge{previous_step:03d}" in challengeTimes:
                        del challengeTimes[f"Challenge{previous_step:03d}"]
                        self.set("ChallengeCompletionSeconds", challengeTimes, group="Statistics")
        except Exception:
            pass
        
        # Reset stopwatch
        try:
            if step > len(challenges_mds):
                self.setStopwatch("stopped", None, 0)
            else:
                self.setStopwatch("running", datetime.datetime.now(datetime.timezone.utc), 0)
        except Exception:
            pass
