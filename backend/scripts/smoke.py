"""Run the packaged app briefly on loopback with an empty in-memory database."""
import json
import pathlib
import subprocess
import time
import urllib.error
import urllib.request

root = pathlib.Path(__file__).resolve().parents[1]
with (root / 'target/smoke.log').open('w') as log:
    process = subprocess.Popen(['java', '-jar', 'target/backend-0.1.0-SNAPSHOT.jar',
        '--server.port=18081',
        '--spring.datasource.url=jdbc:h2:mem:smoke;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE'],
        cwd=root, stdout=log, stderr=subprocess.STDOUT)
    try:
        base = 'http://127.0.0.1:18081'
        for attempt in range(75):
            if process.poll() is not None:
                raise RuntimeError('Backend exited; inspect target/smoke.log')
            try:
                with urllib.request.urlopen(base+'/health', timeout=1) as response:
                    assert json.load(response)['status'] == 'up'
                break
            except urllib.error.URLError:
                time.sleep(.2)
        else:
            raise RuntimeError('Backend startup timed out')
        with urllib.request.urlopen(base+'/api/v1/questionnaire') as response:
            catalog = json.load(response)
            assert len(catalog['questions']) == 85
            assert catalog['version'] == 'onboarding-v1'
            assert catalog['revision'] == 'onboarding-v1.1'
        with urllib.request.urlopen(base+'/api/v1/events') as response:
            assert json.load(response) == []
        try:
            urllib.request.urlopen(base+'/api/v1/me/profile')
            raise AssertionError('Private endpoint admitted an unauthenticated request')
        except urllib.error.HTTPError as error:
            assert error.code == 401
            assert error.headers['Cache-Control'] == 'no-store'
        print('Packaged smoke passed: health 200; 85 questions; empty events; private profile 401')
    finally:
        process.terminate()
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
