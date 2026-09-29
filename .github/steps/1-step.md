## 1단계: Copilot 지침 설정하기

여러분은 Mergington High School에서 학생들을 위한 숙제와 코딩 실습을 만드는 교사입니다. 과제를 공유하는 정적 웹사이트를 관리하고 있으며, 일관된 코드 품질과 프로젝트 구조를 유지할 수 있도록 AI 도우미가 따라야 할 공통 기준을 만들려고 합니다.

Copilot 지침을 사용하면 이 기준을 적용할 수 있습니다!

<details>
<summary>웹사이트 미리 보기 📸</summary><br/>

첫 번째 활동에서 이 웹사이트를 실행합니다!

<img width="600" alt="숙제 웹사이트 화면" src="../images/homework-website-screenshot.png" />

</details>

### 📖 이론: 리포지토리 사용자 지정 지침이란?

리포지토리 사용자 지정 지침을 사용하면 Copilot에 리포지토리별 안내와 기본 설정을 제공하여 프로젝트의 맥락과 기준을 이해하도록 도울 수 있습니다. `.github/copilot-instructions.md` 파일을 만들면 Copilot의 제안이 프로젝트 규칙과 코딩 표준을 일관되게 따르도록 할 수 있습니다.

전체 지침은 이 리포지토리에서 Copilot Chat에 보내는 모든 요청에 자동으로 추가됩니다.

> [!TIP]
> 지침은 간결하게 작성하고 프로젝트를 **어떻게** 작업해야 하는지에 집중하세요. 프로젝트 목적, 폴더 구조, 코딩 표준, 주요 도구, 필요한 형식 등을 포함할 수 있습니다.

자세한 내용은 [GitHub Docs: 리포지토리 사용자 지정 지침](https://docs.github.com/en/copilot/how-tos/custom-instructions/adding-repository-custom-instructions-for-github-copilot)을 참고하세요.

### ⌨️ 활동: 교육용 웹사이트 프로젝트 살펴보기

사용자 지정 지침을 작성하기 전에 개발 환경을 설정하고 프로젝트 구조를 살펴보겠습니다.

1. 아래 버튼을 마우스 오른쪽 버튼으로 클릭하고 새 탭에서 **Create Codespace** 페이지를 엽니다. 기본 구성을 사용하세요.

   [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/{{full_repo_name}}?quickstart=1)

1. **Repository** 필드가 원본이 아닌 여러분이 복사한 실습 리포지토리인지 확인한 다음, 녹색 **Create Codespace** 버튼을 클릭합니다.
   - ✅ 여러분의 복사본: `/{{full_repo_name}}`
   - ❌ 원본: `/skills/customize-your-github-copilot-experience`

1. 브라우저에 Visual Studio Code가 로드되고 모든 확장이 설치될 때까지 잠시 기다립니다.
   - **Live Preview** 확장이 활성화되어 있는지 확인합니다.

1. `index.html`을 마우스 오른쪽 버튼으로 클릭하고 **Show Preview**를 선택하여 웹사이트를 실행합니다.

   > ❕ **중요**: 변경 사항을 실시간으로 확인할 수 있도록 미리 보기 탭을 열어 두세요. 실습을 진행하면서 계속 파일을 수정합니다.

1. 프로젝트 구조를 살펴봅니다.
   - `assets/` 폴더에서 웹사이트 자산(CSS, JavaScript, 이미지)을 확인합니다.
   - `assignments/` 폴더에서 기존 과제 형식을 확인합니다.
   - 루트 디렉터리의 `index.html`에서 기본 웹사이트 구조를 확인합니다.
   - 루트 디렉터리의 `config.json`에서 과제가 어떻게 구성되어 있는지 확인합니다.

### ⌨️ 활동: 리포지토리 Copilot 지침 만들기

프로젝트를 살펴보았으니 Copilot이 이 교육용 웹사이트 프로젝트를 이해할 수 있도록 사용자 지정 지침을 만들어 보겠습니다.

1. VS Code에서 다음 파일을 만듭니다.

   ```text
   .github/copilot-instructions.md
   ```

   > ❕ **중요:** 파일명이 정확한지 확인하세요. Copilot이 지침을 인식하려면 이 파일명을 사용해야 합니다.

1. Copilot이 프로젝트의 목적, 구조, 요구 사항을 이해하도록 다음 내용을 추가합니다.

   ```markdown
   # 프로젝트 설명

   이 프로젝트는 학생들과 숙제 및 코딩 실습을 공유하기 위한 교육용 웹사이트입니다. 학생들은 포털에서 직접 과제를 찾아보고, 내용을 확인하고, 다운로드할 수 있습니다.

   ## 프로젝트 구조

   - [`assignments/`](../assignments/) 각 숙제는 일관된 구조를 가진 개별 하위 폴더에 저장됩니다.
   - [`templates/`](../templates/) 새 콘텐츠에 사용할 수 있는 재사용 가능한 템플릿
   - [`assets/`](../assets/) CSS, JavaScript, 이미지, 구성 파일을 포함한 웹사이트 자산
   - [`index.html`](../index.html) 과제를 찾아보고 확인할 수 있는 정적 포털의 기본 페이지입니다. [`config.json`](../config.json) 파일을 통해 콘텐츠를 구성하고 과제 목록과 세부 정보를 동적으로 생성합니다.

   ## 프로젝트 지침

   - 모든 페이지에서 일관된 스타일을 유지합니다.
   - 파일과 폴더 이름을 설명적이고 체계적으로 작성합니다.

   ## 교육 기준

   이 프로젝트의 콘텐츠를 생성할 때 다음 기준을 따릅니다.

   - **학습 중심**: 모든 콘텐츠는 명확한 학습 목표와 적절한 난이도를 갖추어야 합니다.
   - **학생 친화적**: 학생에게 동기를 부여하는 명확하고 격려하는 표현을 사용합니다.
   ```

1. Copilot에 프로젝트에 관해 질문하여 지침을 테스트합니다.

   > ![Static Badge](https://img.shields.io/badge/-Prompt-text?style=social&logo=github%20copilot)
   >
   > ```prompt
   > 이 프로젝트를 간단히 설명해 줘
   > ```

1. Copilot이 응답에서 사용자 지정 지침을 참조하는지 확인합니다.

   <img width="504" height="183" alt="사용자 지정 지침을 참조한 Copilot 응답" src="../images/copilot-custom-instructions-reference.png" />

1. `.github/copilot-instructions.md` 파일을 `main` 브랜치에 커밋하고 GitHub에 푸시합니다.

1. Mona가 다음 단계를 준비할 때까지 기다립니다!

<details>
<summary>문제가 있나요? 🤷</summary><br/>

- `.github/copilot-instructions.md` 파일은 `.github` 폴더 바로 아래에 있어야 합니다.
- 변경 사항을 커밋하고 푸시했는지 확인하세요.

</details>
