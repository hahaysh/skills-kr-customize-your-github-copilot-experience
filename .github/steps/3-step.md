## 3단계: 재사용 가능한 스킬 만들기

과제에 대한 지침을 마련했으니, 이제 새 과제를 만드는 과정을 간소화해 보겠습니다.

과제 만들기는 여러 단계를 반복해서 수행해야 하므로, 재사용 가능한 스킬을 활용하기에 완벽한 작업입니다!

- 과제 콘텐츠 만들기
- 웹사이트 구성에 과제 등록하기
- 시작 코드 또는 데이터 파일 첨부하기

### 📖 이론: 에이전트 스킬(Agent Skills)

에이전트 스킬은 AI 에이전트에 전문 기능과 워크플로를 제공하기 위한 [개방형 표준](https://agentskills.io/)입니다. 스킬은 메타데이터와 지침이 담긴 `SKILL.md` 파일을 포함하는 폴더이며, 선택적으로 스크립트, 참조 자료 및 기타 리소스를 포함할 수 있습니다.

```text
skill-name/
├── SKILL.md          # 필수: 메타데이터 + 지침
├── scripts/          # 선택 사항: 실행 가능한 코드
├── references/       # 선택 사항: 문서
```

에이전트는 **점진적 공개(progressive disclosure)** 방식으로 스킬을 자동 탐색합니다.

1. **탐색**: 시작할 때 에이전트는 스킬의 `name`과 `description`만 불러옵니다.
1. **활성화**: 작업이 스킬의 설명과 일치하면 에이전트가 `SKILL.md`의 전체 지침을 읽습니다.
1. **리소스**: 추가 파일(참조 자료, 스크립트)은 필요할 때만 불러옵니다.

즉, 많은 스킬을 설치해도 속도가 느려지지 않습니다. 관련 있는 내용만 컨텍스트에 불러오기 때문입니다.

스킬은 두 가지 방식으로 활성화됩니다. Copilot이 요청을 스킬의 설명과 일치시키면 **자동으로** 활성화되며, 슬래시 명령(`/skill-name`)을 사용하면 **명시적으로** 활성화할 수 있습니다. 에이전트는 어떤 스킬을 활성화할지 결정할 때 `name`과 `description`을 기준으로 삼으므로 명확하고 구체적인 설명을 작성하는 것이 중요합니다.

Visual Studio Code는 기본적으로 `.github/skills/` 디렉터리에서 스킬을 탐색합니다.

> [!TIP]
> 에이전트가 스킬을 **언제** 사용해야 하는지 알 수 있도록 frontmatter의 `description`을 명확하게 작성하세요. 템플릿, 예제 및 자세한 문서는 추가 파일로 참조하세요.

자세한 내용은 [VS Code 문서: 에이전트 스킬](https://code.visualstudio.com/docs/copilot/customization/agent-skills)을 참조하세요.

### ⌨️ 실습: 스킬 기본 구조 만들기

먼저 전체 스킬 디렉터리 구조와 기본 `SKILL.md` 파일을 만들어 보겠습니다. 이후 실습에서 파일을 추가할 수 있도록 `references/`와 `scripts/`를 포함한 모든 디렉터리를 미리 만듭니다.

1. 모든 하위 디렉터리를 포함하는 스킬 디렉터리 구조를 만듭니다.

   ```text
   .github/skills/new-assignment/
   .github/skills/new-assignment/references/
   .github/skills/new-assignment/scripts/
   ```

1. 기본 스킬 파일을 만듭니다.

   ```text
   .github/skills/new-assignment/SKILL.md
   ```

1. 다음 내용을 추가합니다. frontmatter의 `name`과 `description`은 에이전트가 탐색 단계에서 스킬을 활성화할지 판단할 때 확인하는 정보입니다. 본문에는 스킬이 활성화된 후 에이전트가 따를 워크플로가 담겨 있습니다.

   ```markdown
   ---
   name: new-assignment
   description: Mergington High School 학생을 위한 새 프로그래밍 과제를 만듭니다. 사용자가 "assignment"라는 단어를 명시적으로 사용하지 않더라도 새 과제, 연습 문제 또는 숙제를 만들거나 추가하거나 기본 구조를 구성하거나 생성하려는 경우 이 스킬을 사용하세요.
   ---

   # 새 프로그래밍 과제 만들기

   과제는 `assignments/<id>/`에 있으며, 웹사이트는 `config.json`을 읽어 과제를 표시합니다. 다음 단계에 따라 두 항목을 모두 만드세요.

   ## 1단계: 요구 사항 수집

   사용자가 지정하지 않았다면 과제에서 다룰 프로그래밍 개념을 물어보세요.

   > 📖 난이도, 범위 및 시작 코드를 포함할 시점에 관한 지침은 [references/assignment-guide.md](references/assignment-guide.md)를 참조하세요.

   ## 2단계: 과제 만들기

   1. [과제 템플릿](../../../templates/assignment-template.md)에 따라 `assignments/<kebab-case-id>/README.md`를 만듭니다.
   2. (선택 사항) 같은 디렉터리에 시작 코드 또는 데이터 파일을 추가합니다.

   ## 3단계: 웹사이트에 등록

   포함된 스크립트를 사용하세요. `config.json`을 수동으로 편집하지 마세요.

   **과제 등록:**

       node .github/skills/new-assignment/scripts/update-config.js <id> "<title>" "<description>"

   **각 파일을 첨부 파일로 등록**(시작 코드, 데이터 파일 등):

       node .github/skills/new-assignment/scripts/add-attachment.js <id> "<display-name>" <filename> <type>

   일반적인 형식: `python`, `csv`, `json`, `txt`, `html`

   ## 4단계: 확인

   과제가 올바르게 등록되었는지 확인하세요. `config.json`에 새 항목이 포함되어 있고 생성한 모든 파일이 디스크에 존재하는지 검사합니다.
   ```

   `SKILL.md`가 아직 만들지 않은 두 디렉터리인 `references/`와 `scripts/`를 참조하고 있다는 점에 주목하세요. 이것이 점진적 공개 패턴의 실제 모습입니다. 에이전트는 해당 파일이 필요한 단계에 도달했을 때만 파일을 불러옵니다.

### ⌨️ 실습: 참조 가이드 추가하기

에이전트가 필요할 때 참고할 수 있는 도메인 지식으로 `references/` 디렉터리를 채워 보겠습니다. `SKILL.md`는 `references/assignment-guide.md`를 가리키므로 에이전트가 난이도와 범위를 결정할 때 이 파일을 읽을 수 있지만, 실제로 해당 컨텍스트가 필요할 때만 읽습니다.

1. 참조 파일을 만듭니다.

   ```text
   .github/skills/new-assignment/references/assignment-guide.md
   ```

1. 에이전트에 교육학적 지침을 제공하도록 다음 내용을 추가합니다.

   ```markdown
   # 과제 설계 가이드

   과제 콘텐츠 설계에 관한 지침으로, 무엇을 가르치고 범위를 어떻게 정할지 설명합니다. 형식과 Markdown 구조는 프로젝트의 지침 파일이 자동으로 처리합니다.

   ## 난이도 및 범위

   - 서로 연계되는 작업을 2~4개 포함하도록 구성합니다.
   - 학생이 10분 이내에 완료할 수 있는 내용으로 시작한 다음 복잡도를 높입니다.
   - 마지막 작업은 도전 목표로 구성할 수 있지만, 앞선 작업은 자신감을 키울 수 있어야 합니다.
   - 과제 하나당 핵심 개념 하나만 다룹니다(예: "반복문 + 파일 I/O + 오류 처리"가 아닌 "반복문").

   ## 시작 코드

   다음과 같은 경우 시작 코드를 포함합니다.

   - 학생이 처음부터 작성할 필요가 없는 상용구 코드가 과제에 필요한 경우
   - 학생들이 특정 함수 시그니처 또는 구조를 따르도록 하려는 경우

   처음부터 직접 작성하는 것이 핵심인 경우(예: "…하는 스크립트를 작성하세요")에는 포함하지 않습니다.

   ## 난이도별 주제 예시

   - **초급**: 변수, 조건문, 반복문, 문자열 형식 지정
   - **중급**: 함수, 리스트/딕셔너리, 파일 I/O, 기본 클래스
   - **고급**: API, 데이터 분석, 테스트, 웹 프레임워크
   ```

   이 내용을 `SKILL.md`와 분리하면 기본 지침은 _워크플로_에 집중하고 이 파일은 _도메인 지식_을 제공할 수 있습니다. 에이전트는 요구 사항 수집 단계에 도달했을 때만 이 파일을 읽습니다.

### ⌨️ 실습: 포함된 스크립트 추가하기

코드가 AI보다 더 안정적으로 처리할 수 있는 결정론적 작업을 위해 스킬에 스크립트를 포함할 수 있습니다. 이 스킬에는 두 개의 스크립트가 필요합니다. 하나는 `config.json`에 과제를 등록하고, 다른 하나는 파일(시작 코드, 데이터 세트 등)을 과제에 첨부합니다. 에이전트가 이러한 스크립트를 실행하게 하면 매번 일관되고 오류 없이 구성을 업데이트할 수 있습니다.

1. 새 과제를 등록하는 첫 번째 스크립트를 만듭니다.

   ```text
   .github/skills/new-assignment/scripts/update-config.js
   ```

   다음 내용을 추가합니다.

   ```javascript
   const fs = require("fs");
   const path = require("path");

   const [id, title, description] = process.argv.slice(2);
   const configPath = path.resolve(__dirname, "../../../../config.json");
   const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

   if (!id || !title || !description) {
     console.error(
       'Usage: node .github/skills/new-assignment/scripts/update-config.js <id> "<title>" "<description>"',
     );
     process.exit(1);
   }

   const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

   config.assignments.push({
     id,
     title,
     description,
     path: `assignments/${id}`,
     dueDate,
   });

   fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
   console.log(`Added "${title}" (due ${dueDate})`);
   ```

   이 스크립트는 마감일 계산과 정확한 JSON 구조를 처리합니다. AI가 매번 정확하게 처리하기에는 번거롭고 오류가 발생하기 쉬운 작업입니다.

1. 기존 과제에 파일을 첨부하는 두 번째 스크립트를 만듭니다.

   ```text
   .github/skills/new-assignment/scripts/add-attachment.js
   ```

   다음 내용을 추가합니다.

   ```javascript
   const fs = require("fs");
   const path = require("path");

   const [assignmentId, displayName, filename, type] = process.argv.slice(2);

   if (!assignmentId || !displayName || !filename || !type) {
     console.error(
       'Usage: node add-attachment.js <assignment-id> "<display-name>" <filename> <type>',
     );
     console.error(
       'Example: node add-attachment.js python-basics "Starter Code" starter-code.py python',
     );
     process.exit(1);
   }

   const repoRoot = path.resolve(__dirname, "../../../../");
   const configPath = path.join(repoRoot, "config.json");
   const filePath = path.join(repoRoot, "assignments", assignmentId, filename);

   // 파일이 디스크에 존재하는지 확인
   if (!fs.existsSync(filePath)) {
     console.error(`Error: File not found: assignments/${assignmentId}/${filename}`);
     process.exit(1);
   }

   const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
   const assignment = config.assignments.find((a) => a.id === assignmentId);

   if (!assignment) {
     console.error(`Error: Assignment "${assignmentId}" not found in config.json`);
     console.error("Available IDs:", config.assignments.map((a) => a.id).join(", "));
     process.exit(1);
   }

   // attachments 배열이 없으면 생성
   if (!assignment.attachments) {
     assignment.attachments = [];
   }

   // 파일 이름이 같은 첨부 파일이 이미 있으면 건너뜀
   const existing = assignment.attachments.find((a) => a.file === filename);
   if (existing) {
     console.log(`Skipped: "${filename}" is already attached to "${assignmentId}"`);
     process.exit(0);
   }

   assignment.attachments.push({
     name: displayName,
     file: filename,
     type: type,
   });

   fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
   console.log(`Added "${displayName}" (${filename}) to assignment "${assignmentId}"`);
   ```

   두 번째 스크립트는 파일이 실제로 존재하는지 검증하고 중복 첨부를 방지하며 명확한 오류 메시지를 생성합니다. 이 모든 기능 덕분에 에이전트가 실행할 때 스킬이 더 안정적으로 작동합니다.

1. 최종 스킬 구조를 검토합니다. 다음과 같은 모습이어야 합니다.

   ```text
   .github/skills/new-assignment/
   ├── SKILL.md                          # 에이전트가 따르는 워크플로
   ├── references/
   │   └── assignment-guide.md           # 도메인 지식(필요할 때 불러옴)
   └── scripts/
       ├── update-config.js              # 새 과제 등록
       └── add-attachment.js             # 과제에 파일 첨부
   ```

   스킬의 각 부분에는 명확한 역할이 있습니다.
   - **`SKILL.md`** — 에이전트의 플레이북: 따라야 할 단계와 다른 리소스를 불러올 시점
   - **`references/`** — 에이전트가 더 나은 결정을 내리는 데 도움이 되는 배경지식
   - **`scripts/`** — AI 생성 대신 코드로 처리하는 결정론적 작업

### ⌨️ 실습: 과제 스킬 테스트하기

1. VS Code에서 Copilot Chat을 열고 `Agent` 모드인지 확인합니다.

1. 자연어 프롬프트를 사용하여 Copilot에 새 과제를 만들어 달라고 요청합니다. 스킬에 명확한 `description`이 있으므로 Copilot이 요청을 자동으로 일치시켜 스킬을 활성화합니다.

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=social&logo=github%20copilot)
   >
   > ```prompt
   > FastAPI 프레임워크로 REST API를 구축하는 방법에 대한 새 과제를 만들어 주세요
   > ```

   > 💡 **팁:** 채팅 입력란에서 `/new-assignment` 슬래시 명령을 사용하여 스킬을 명시적으로 호출할 수도 있습니다.

      <details>
      <summary>💡 과제 주제 아이디어</summary>

   ```text
   Python 텍스트 처리 - 문자열, 파일 I/O 및 텍스트 조작
   ```

   ```text
   Python의 데이터 구조 - 리스트, 딕셔너리, 집합 및 튜플
   ```

   ```text
   Python 데이터 시각화 - matplotlib 또는 plotly를 사용한 차트와 그래프
   ```

   ```text
   FastAPI 프레임워크로 REST API 구축하기
   ```

   ```text
   Python을 활용한 통계 - pandas와 numpy를 사용한 데이터 분석 및 통계 계산
   ```

      </details>

1. Copilot이 스킬을 읽고 과제를 만든 다음 포함된 스크립트를 실행합니다.

   <img width="380" alt="Copilot이 new-assignment SKILL.md 파일을 읽는 모습" src="../images/skill-being-used.png" />

   계속 진행할 수 있도록 모든 확인 프롬프트를 수락합니다.

   <img width="380" alt="Copilot이 node 스크립트 실행 확인을 요청하는 모습" src="../images/node-confirmation.png" />

1. 웹사이트 미리 보기의 과제 목록에 새 과제가 표시되는지 확인합니다.

   <details>
   <summary>과제가 표시되지 않나요? 🔍</summary>

   다음 항목을 확인하세요.
   - 페이지를 새로 고칩니다.
   - `assignments/`에 새 디렉터리가 생성되었습니다.
   - `config.json` 파일이 새 과제로 업데이트되었습니다.

   </details>

1. 생성된 과제 콘텐츠가 앞서 정한 규칙과 일치하는지 검토합니다.

1. 변경 사항을 커밋하고 푸시합니다.
   - 새 스킬 디렉터리: `.github/skills/new-assignment/` (`SKILL.md`, `references/`, `scripts/` 포함)
   - 생성된 과제 디렉터리와 파일
   - 업데이트된 `config.json` 구성

1. Mona가 다음 단계를 준비할 때까지 기다리세요!

<details>
<summary>문제가 있나요? 🤷</summary><br/>

- 스킬이 `SKILL.md` 파일과 함께 `.github/skills/new-assignment/` 디렉터리에 있는지 확인하세요.
- `SKILL.md` frontmatter의 `name` 필드는 상위 디렉터리 이름(`new-assignment`)과 일치해야 합니다.
- `/` 메뉴에 스킬이 표시되지 않으면 VS Code 창을 다시 불러오세요.

</details>
