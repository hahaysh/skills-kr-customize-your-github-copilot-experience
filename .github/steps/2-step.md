## 2단계: 파일별 지침

프로젝트의 공통 지침을 준비하고 보니 과제에만 적용되는 구체적인 형식 규칙도 필요합니다. 리포지토리 전체 지침은 일반적인 코딩 표준에 적합하지만, 모든 채팅 메시지에 포함되는 지침을 세부적인 과제 구조 요구 사항으로 복잡하게 만들고 싶지는 않습니다.

학생들이 일관된 경험을 할 수 있도록 모든 과제가 같은 형식과 구조를 따르게 하되, 이 규칙은 과제 파일을 작업할 때만 적용되어야 합니다.

### 📖 이론: 사용자 지정 지침 파일

지침 파일(`*.instructions.md`)은 프로젝트의 특정 파일이나 디렉터리에 맞춘 지침을 Copilot에 제공합니다.

어디에나 적용되는 리포지토리 전체 지침과 달리, 이 파일은 [프런트매터](https://jekyllrb.com/docs/front-matter/)의 `applyTo` 필드에 [glob 구문](https://code.visualstudio.com/docs/editor/glob-patterns)을 사용하여 대상 파일을 지정합니다. Copilot이 해당 패턴과 일치하는 파일을 작업할 때 지침이 자동으로 적용됩니다. 또는 Copilot Chat의 **Add Context** 버튼을 사용하여 지침을 직접 첨부할 수도 있습니다.

Visual Studio Code는 [기본적으로](vscode://settings/chat.instructionsFilesLocations) `.github/instructions/` 디렉터리에서 `*.instructions.md` 파일을 찾습니다.

> [!TIP]
> 지침은 작업을 **어떻게** 수행해야 하는지에 집중해야 합니다. 즉, 해당 코드 영역에서 사용하는 지침, 표준, 규칙을 설명해야 합니다.

자세한 내용은 [VS Code Docs: 사용자 지정 지침](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions)을 참고하세요.

### ⌨️ 활동: 과제별 지침 만들기

과제 파일이 일관된 구조와 형식을 따르도록 과제 전용 지침을 만들어 보겠습니다.

1. 먼저 기존 과제 템플릿을 살펴봅니다. `templates/assignment-template.md`를 열어 모든 과제가 따라야 할 구조를 확인합니다.

1. 다음 파일을 만듭니다.

   ```text
   .github/instructions/assignments.instructions.md
   ```


1. 다음 내용을 추가하여 과제 형식 표준을 정의합니다. 이 지침은 `assignments` 디렉터리의 Markdown(`.md`) 파일에 관한 모든 채팅 요청에 자동으로 적용됩니다.

   ```markdown
   ---
   description: "학생에게 일관되고 명확한 과제를 제공하기 위해 과제 Markdown 파일을 만들거나 편집할 때 사용하는 지침입니다."
   applyTo: "assignments/**/*.md"
   ---

   # 과제 Markdown 구조 지침

   모든 과제 Markdown 파일은 다음 지침을 따라야 합니다.

   ## 1. 템플릿 사용

   - 과제 Markdown 파일은 [`templates/assignment-template.md`](../../templates/assignment-template.md)의 구조를 따라야 합니다.
   - 과제는 `README.md` 파일로 만들어야 합니다.
   - 템플릿의 필수 섹션을 제거하거나 생략하지 마세요.

   ## 2. 섹션 지침

   섹션 헤더는 아이콘을 포함하여 템플릿의 구조를 정확히 따라야 합니다. 워크플로 검증을 위해 `## 🎯 Objective`와 `## 📝 Tasks` 헤더를 번역하거나 변경하지 마세요.

   - **제목**: `[Assignment Title]`을 짧고 설명적인 이름으로 바꿉니다(예: `Python Basics`, `Loops and Conditionals`, `Functions and Modules`).
   - **Objective**: 학생이 무엇을 배우거나 완성할지 1~2개의 문장으로 요약합니다. 주요 기술이나 개념에 집중합니다.
   - **Tasks**: 각 작업에 다음 기준을 적용합니다.
      - 구체적이고 행동 중심적인 작업 이름을 사용합니다.
      - Description에는 학생이 해야 할 일을 명확하게 작성합니다.
      - Requirements에는 예상 결과나 기능을 글머리 기호로 나열합니다. 구체적이고 측정 가능하게 작성합니다.
      - 도움이 된다면 코드 블록으로 입력 및 출력 예제를 제공합니다.

   명시적으로 요청하지 않은 섹션은 추가하지 마세요.
   ```

> [!IMPORTANT]
> `applyTo`는 Copilot이 인식하는 프런트매터 키이며, `🎯 Objective`와 `📝 Tasks`는 이 실습의 워크플로가 확인하는 헤더입니다. 코드 예제에서는 이 값을 번역하거나 변경하지 마세요.

### ⌨️ 활동: 과제 지침 테스트하기

1. VS Code에서 `assignments/games-in-python/README.md` 파일을 엽니다. 이 과제는 앞에서 설정한 모든 규칙을 따르고 있지 않습니다.

1. 과제 파일의 현재 구조를 살펴보고 앞에서 확인한 템플릿 구조와 어떻게 다른지 비교합니다. **Site Preview** 탭에서 현재 표시되는 모습도 확인할 수 있습니다.

1. 과제 파일을 연 상태에서 `Agent` 모드의 Copilot에 과제 구조를 업데이트하도록 요청합니다.

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=social&logo=github%20copilot)
   >
   > ```prompt
   > 이 과제 파일이 프로젝트 표준과 템플릿 구조를 따르도록 업데이트해 줘
   > ```

1. Copilot이 프로젝트 공통 지침과 과제 전용 지침 파일을 어떻게 참조하는지 확인합니다.

   <img width="600" alt="첨부된 참조를 보여 주는 Copilot Chat 화면" src="../images/copilot-chat-reviews-instructions.png" />

1. 제안된 변경 사항을 원래 파일 구조와 비교하여 Copilot이 지침을 어떻게 적용했는지 확인합니다. 제안된 변경 사항을 적용하고 **Site Preview**에서 업데이트된 과제가 어떻게 보이는지 확인합니다.

1. 다음 두 파일을 `main` 브랜치에 커밋하고 변경 사항을 GitHub에 푸시합니다.

   - `.github/instructions/assignments.instructions.md`
   - `assignments/games-in-python/README.md`

1. Mona가 다음 단계를 준비할 때까지 기다립니다!

<details>
<summary>문제가 있나요? 🤷</summary><br/>

- 다음 두 파일을 `main` 브랜치에 커밋했는지 확인하세요.
  - `.github/instructions/assignments.instructions.md`
  - `assignments/games-in-python/README.md`

</details>
