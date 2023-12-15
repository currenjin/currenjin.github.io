---
layout  : wiki
title   : Typescript Compile.. 그거 어떻게 동작하는데?
summary :
date    : 2023-12-15 16:00:00 +0900
updated : 2023-12-15 16:00:00 +0900
tag     : Typescript
toc     : true
public  : true
parent  : [[how-to]]
latex   : true
---
* TOC
{:toc}

# Typescript Compile

타입스크립트는 자바스크립트의 슈퍼셋, 자바스크립트에서 정의할 수 없었던 타입을 정의해 소프트웨어 안정성을 높이는 데에 큰 비중을 차지한다.

## 동작과정 

아래 그림은 Typescript Compile 과정의 모식도다.

`![스크린샷 2023-12-15 오후 12 35 17](https://github.com/currenjin/currenjin.github.io/assets/60500649/95b91a12-3972-4669-aba5-4339e4c87493)`

이런 모식도만 본다고 우리가 코드 동작 과정을 이해하고자 하는 욕구는 사라지지 않을 것이다.

나는 tsc 명령어를 입력하는 순간 typescript 코드 속으로 빨려 들어가 볼 것이다. javascript 코드로 컴파일하기 위해 tsc 명령어를 입력했다. 그 순간, 나는 `node_modules/typescript` 디렉토리로 빨려들어간다.

슝….🚀

### tsc

tsc 명령어를 입력했을 때, 가장 처음 마주하는 파일은 `src/tsc/tsc.ts`이다.

```javascript
ts.executeCommandLine(ts.sys, ts.noop, ts.sys.args);
```

파일 내부에 위 코드가 한 줄 보이는가? 해당 함수가 호출되면서 우리는 또 그 속으로 빨려들어간다.

(to `src/executeCommandLine/executeCommandLine.ts`)

### executeCommandLine

```javascript
if (isBuild(commandLineArgs)) {
	...
} else {
	return executeCommandLineWorker(system, cb, commandLine);
}
```

도착했더니 분기 하나가 나를 마주한다. 명령어 내에 build 옵션을 추가했는지 확인하는 분기다. 우리는 해당 옵션을 주지 않았으니 else로 넘어가자. else에서 executeCommandLine 함수가 호출된다.

<br>

```javascript
performCompilation(
    sys,
    cb,
    reportDiagnostic,
    configParseResult,
);
```

내부에서는 performCompilation 함수가 호출된다. 따라가보자.

<br>

```javascript
const host = createCompilerHostWorker(options, /*setParentNodes*/ undefined, sys);

...

const programOptions: CreateProgramOptions = {
    rootNames: fileNames,
    options,
    projectReferences,
    host,
    configFileParsingDiagnostics: getConfigFileParsingDiagnostics(config),
};
const program = createProgram(programOptions);

...
```

내부에선 compiler를 생성하고, createProgram 함수를 호출해 program 객체를 생성한다. 한 번 이동해 보자.

(to `src/compiler/program.ts`)

### program

내용이 어마어마하다. 해당 함수에서 program 객체를 생성하기 위한 일련의 행동을 한다. 주요 요소만 확인해 보자면, 필드에 TypeChecker getter, Diagnostics getter, emit 함수 등이 정의되고, Parser를 호출하여 AST를 생성한다. 생성된 AST를 통해 Binder를 호출하는데, 이곳에서 Node, Symbol 간의 Mapping을 진행해 Symbol Table이 생성된다. 이것은 추후 타입을 체크하기 위해 필요한 테이블이다.

반환된 값으로 무엇을 하는지 다시 빠져나와보자.

(to `src/executeCommandLine/executeCommandLine.ts`)

### executeCommandLine

```javascript
const program = createProgram(programOptions);
const exitStatus = emitFilesAndReportErrorsAndGetExitStatus(
    program,
    reportDiagnostic,
    s => sys.write(s + sys.newLine),
    createReportErrorSummary(sys, options),
);
```

생성된 progrogram 객체를 인자로 넘겨 emitFilesAndReportErrorsAndGetExitStatus 함수를 호출하네? 무슨 동작을 하는지 해당 함수 내부를 살펴보자.

(to `src/compiler/watch.ts`)

### watch

```javascript
addRange(allDiagnostics, program.getSyntacticDiagnostics(/*sourceFile*/ undefined, cancellationToken));

// If we didn't have any syntactic errors, then also try getting the global and
// semantic errors.
if (allDiagnostics.length === configFileParsingDiagnosticsLength) {
    addRange(allDiagnostics, program.getOptionsDiagnostics(cancellationToken));

    if (!isListFilesOnly) {
        addRange(allDiagnostics, program.getGlobalDiagnostics(cancellationToken));

        if (allDiagnostics.length === configFileParsingDiagnosticsLength) {
            addRange(allDiagnostics, program.getSemanticDiagnostics(/*sourceFile*/ undefined, cancellationToken));
        }
    }
}

...

const emitResult = isListFilesOnly
    ? { emitSkipped: true, diagnostics: emptyArray }
    : program.emit(/*targetSourceFile*/ undefined, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);

...

return {
    emitResult,
    diagnostics,
};
```

함수 내부에서, emitFilesAndreportErrors 함수를 호출하며 emitResult와 diagnotics 값을 받는데, 해당 함수 내부에서는 program에서 준비한 diagnostics getter를 호출해 diagnostics를 가져오고, program의 emit을 호출하여 emit의 결과값을 받아 diagnostics, emitResult를 반환한다.

emitResult가 존재한다면, 이미 emit은 진행된 것이 아닌가? 그러면 해당 함수 내부에서 어떤 동작을 하는지 확인할 필요가 있겠다.

(to `src/compiler/program.ts`)

### program

```javascript
function emit(sourceFile?: SourceFile, writeFileCallback?: WriteFileCallback, cancellationToken?: CancellationToken, emitOnly?: boolean | EmitOnly, transformers?: CustomTransformers, forceDtsEmit?: boolean): EmitResult {
    tracing?.push(tracing.Phase.Emit, "emit", { path: sourceFile?.path }, /*separateBeginAndEnd*/ true);
    const result = runWithCancellationToken(() => emitWorker(program, sourceFile, writeFileCallback, cancellationToken, emitOnly, transformers, forceDtsEmit));
    tracing?.pop();
    return result;
}
```

emit을 호출했을 때에는 AST 소스코드를 변경하기 위한 Emit Worker를 생성한다.

```javascript
const emitResult = emitFiles(
    emitResolver,
    getEmitHost(writeFileCallback),
    sourceFile,
    getTransformers(options, customTransformers, emitOnly),
    emitOnly,
    /*onlyBuildInfo*/ false,
    forceDtsEmit,
);
```

해당 워커에서는 emitFiles라는 함수를 호출하는데, 드디어 해당 함수에서 AST를 순회하며, 각 Node를 처리해 Javascript 소스코드가 생성되는 것이다.

마지막으로 emitFiles 속으로 빨려들어가 어떤 동작이 수행되는지 확인해보자.

(to `src/compiler/emitter`)

### emitter

```javascript
forEachEmittedFile(
    host,
    emitSourceFileOrBundle,
    getSourceFilesToEmit(host, targetSourceFile, forceDtsEmit),
    forceDtsEmit,
    onlyBuildInfo,
    !targetSourceFile,
);

return {
    emitSkipped,
    diagnostics: emitterDiagnostics.getDiagnostics(),
    emittedFiles: emittedFilesList,
    sourceMaps: sourceMapDataList,
};
```

forEachEmittedFile 함수를 호출해 타겟 파일들을 모두 순회하며 emit을 진행한다. 결과적으로 diagnostics, emittedFiles, sourceMaps 등을 반환하는 것을 확인할 수 있다.