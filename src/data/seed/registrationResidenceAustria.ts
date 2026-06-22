import type { SeedContentCatalog } from "../../domain/content";

export const registrationResidenceAustriaSeed: SeedContentCatalog = {
  lifeSituations: [
    {
      id: "life-situation-registration-residence-austria",
      title: "Регистрация места жительства в Австрии",
      summary:
        "Пользователь занял новое жилье в Австрии или готовится к этому и хочет понять, как подготовиться к регистрации адреса, какие документы и данные могут понадобиться, где проверить требования и какие ограничения важны до обращения в Meldebehoerde.",
      userPhrase:
        "Я переехал или скоро въезжаю в жилье в Австрии и хочу понять, что нужно подготовить для Anmeldung des Wohnsitzes.",
      supportBoundary:
        "Nova Agent помогает подготовиться и структурировать путь, но регистрация выполняется пользователем через компетентный орган или официальный онлайн-сервис, если он применим.",
      scenarioIds: ["scenario-registration-residence-austria"],
    },
  ],
  scenarios: [
    {
      id: "scenario-registration-residence-austria",
      title: "Регистрация места жительства в Австрии",
      lifeSituationIds: ["life-situation-registration-residence-austria"],
      versionIds: ["scenario-version-registration-residence-austria-v1"],
    },
  ],
  scenarioVersions: [
    {
      id: "scenario-version-registration-residence-austria-v1",
      scenarioId: "scenario-registration-residence-austria",
      publicationState: "published",
      versionLabel: "v1",
      title: "Регистрация места жительства в Австрии",
      goal:
        "Помочь пользователю подготовиться к Anmeldung eines neuen Hauptwohnsitzes oder Nebenwohnsitzes в Австрии.",
      expectedOutcome:
        "Пользователь понимает, применим ли сценарий, какие шаги идут в каком порядке, какие документы и данные могут потребоваться, какие источники нужно проверить, какие вопросы остаются открытыми и какие ограничения должны быть видны до внешнего действия.",
      nonGuarantees: [
        "Nova Agent не обещает, что регистрация будет принята.",
        "Nova Agent не подтверждает, что документы достаточны для конкретного органа.",
        "Nova Agent не определяет за пользователя правильный тип Wohnsitz.",
        "Nova Agent не гарантирует применимость онлайн-сервиса, сроки или итог внешнего процесса.",
      ],
      applicabilityConditions: [
        {
          id: "ac-factual-occupation",
          text: "Пользователь занимает или собирается фактически занять жилье в Австрии.",
        },
        {
          id: "ac-hauptwohnsitz-or-nebenwohnsitz",
          text: "Пользователь хочет зарегистрировать новый Hauptwohnsitz или weiteren Wohnsitz / Nebenwohnsitz.",
        },
        {
          id: "ac-after-move-in",
          text: "Пользователь понимает, что Anmeldung допускается после фактического въезда, а не только после подписания договора или получения ключей.",
        },
        {
          id: "ac-official-local-check",
          text: "Пользователь готов проверить требования в официальном источнике для своего города или Gemeinde.",
        },
        {
          id: "ac-residence-law-separate",
          text: "Если пользователь не имеет австрийского гражданства, он отдельно учитывает требования Aufenthaltsrecht, потому что регистрация адреса не заменяет вопросы права пребывания.",
        },
      ],
      warnings: [
        {
          id: "warning-after-factual-occupation",
          text: "Anmeldung выполняется после фактического занятия жилья. Регистрация без фактического проживания может считаться Scheinmeldung и иметь последствия по Meldegesetz.",
        },
        {
          id: "warning-registration-term-from-move-in",
          text: "Срок регистрации обычно считается от фактического въезда, а не от даты договора или передачи ключей.",
        },
        {
          id: "warning-local-requirements-differ",
          text: "Требования к документам и способ подачи могут отличаться по Gemeinde или городу. Перед визитом или отправкой документов нужно проверить сайт компетентной Meldebehoerde.",
        },
        {
          id: "warning-no-document-verification",
          text: "Nova Agent не проверяет документы и не подтверждает, что пакет достаточен для конкретного органа.",
        },
        {
          id: "warning-residence-law-separate",
          text: "Если пользователь не является гражданином Австрии, регистрация адреса не решает вопросы Aufenthaltsrecht.",
        },
      ],
      restrictions: [
        {
          id: "restriction-residence-registration-only",
          text: "Сценарий описывает только регистрацию места жительства в Австрии.",
        },
        {
          id: "restriction-no-adjacent-admin-scope",
          text: "Сценарий не описывает оформление вида на жительство, работу, страховку, налоги, банковские вопросы или социальные выплаты.",
        },
        {
          id: "restriction-no-document-storage",
          text: "Сценарий не описывает хранение или загрузку Meldezettel, паспорта, договора аренды или других пользовательских документов.",
        },
        {
          id: "restriction-no-submission-or-booking",
          text: "Сценарий не добавляет автоматическую подачу формы, запись на прием или отправку документов.",
        },
        {
          id: "restriction-no-admin-workflow",
          text: "Сценарий не создает отдельный административный workflow для Content Admin.",
        },
        {
          id: "restriction-official-sources-win",
          text: "Сценарий не заменяет официальную информацию Meldebehoerde, oesterreich.gv.at, Stadt Wien или RIS.",
        },
      ],
      steps: [
        {
          id: "step-check-registration-need",
          order: 1,
          title: "Проверить, нужно ли регистрировать адрес",
          purpose:
            "Понять, относится ли ситуация пользователя к Anmeldung eines Wohnsitzes.",
          userShouldUnderstand:
            "Регистрация нужна при первом занятии жилья в Австрии, при переезде внутри Австрии или при создании weiteren Wohnsitz / Nebenwohnsitz. Возможные исключения нужно проверять в официальном источнике.",
          requirementIds: [
            "data-new-address",
            "data-factual-move-in-date",
            "data-existing-registration-context",
          ],
          sourceIds: ["source-oesterreich-anmeldung", "source-oesterreich-wohnsitz-types", "source-ris-meldegesetz"],
          warningIds: ["warning-registration-term-from-move-in"],
          restrictionIds: ["restriction-official-sources-win"],
        },
        {
          id: "step-determine-wohnsitz-and-authority",
          order: 2,
          title: "Определить тип Wohnsitz и компетентный орган",
          purpose:
            "Понять, идет ли речь о Hauptwohnsitz или weiteren Wohnsitz / Nebenwohnsitz, и где проверять требования.",
          userShouldUnderstand:
            "Hauptwohnsitz связан с Mittelpunkt der Lebensbeziehungen; при нескольких адресах только один может быть Hauptwohnsitz. Компетентный орган зависит от места жилья.",
          requirementIds: [
            "data-new-address",
            "data-municipality",
            "data-wohnsitz-type",
            "data-previous-main-residence",
          ],
          sourceIds: ["source-oesterreich-anmeldung", "source-oesterreich-wohnsitz-types", "source-stadt-wien-anmelden"],
          warningIds: [],
          restrictionIds: ["restriction-official-sources-win"],
        },
        {
          id: "step-prepare-meldezettel",
          order: 3,
          title: "Подготовить Meldezettel и подпись Unterkunftgeber",
          purpose: "Подготовить базовую форму регистрации.",
          userShouldUnderstand:
            "Для каждой регистрируемой персоны нужен отдельный Meldezettel. Он должен быть заполнен и подписан пользователем как meldepflichtige Person и Unterkunftgeber.",
          requirementIds: [
            "document-meldezettel",
            "data-new-address",
            "data-user-personal-details",
            "document-unterkunftgeber-signature",
          ],
          sourceIds: ["source-oesterreich-anmeldung", "source-ris-meldegesetz", "source-meldezettel-form"],
          warningIds: ["warning-no-document-verification"],
          restrictionIds: ["restriction-no-document-storage"],
        },
        {
          id: "step-prepare-identity-documents",
          order: 4,
          title: "Подготовить документы, удостоверяющие личность и данные",
          purpose:
            "Собрать документы, которые могут понадобиться для подтверждения личных данных.",
          userShouldUnderstand:
            "Официальные источники указывают на документы или публичные Urkunden, из которых видны необходимые личные данные. Для иностранных граждан обычно требуется Reisedokument, например паспорт.",
          requirementIds: [
            "document-passport-or-travel-document",
            "document-birth-certificate-or-public-record",
            "document-minors-or-representatives",
            "document-housing-proof-if-requested",
          ],
          sourceIds: ["source-oesterreich-anmeldung", "source-ris-meldegesetz"],
          warningIds: ["warning-no-document-verification"],
          restrictionIds: ["restriction-no-document-storage"],
        },
        {
          id: "step-choose-submission-method",
          order: 5,
          title: "Выбрать способ подачи и выполнить внешнее действие",
          purpose:
            "Понять доступные способы обращения, не смешивая их с действиями Nova Agent.",
          userShouldUnderstand:
            "Регистрация может выполняться лично, почтой, через Bote или онлайн, если применим официальный онлайн-сервис и выполнены условия. Fax или E-Mail не являются допустимым способом по информации oesterreich.gv.at.",
          requirementIds: [
            "document-meldezettel",
            "document-passport-or-travel-document",
            "data-submission-method",
            "data-id-austria-or-eu-login",
          ],
          sourceIds: ["source-oesterreich-anmeldung", "source-ris-meldegesetz"],
          warningIds: ["warning-local-requirements-differ"],
          restrictionIds: ["restriction-no-submission-or-booking"],
        },
        {
          id: "step-receive-confirmation-and-record-progress",
          order: 6,
          title: "Получить подтверждение и сохранить собственный контекст",
          purpose:
            "Помочь пользователю понять, что происходит после внешнего обращения, и сохранить контекст для дальнейшего прохождения.",
          userShouldUnderstand:
            "После регистрации пользователь получает Bestaetigung der Meldung. Любая будущая пользовательская отметка в Nova Agent остается пользовательской записью, а не официальным подтверждением от продукта.",
          requirementIds: [
            "data-external-contact-fact",
            "document-meldebestaetigung-reference",
            "data-questions-for-meldebehoerde",
            "data-checked-source-context",
          ],
          sourceIds: ["source-oesterreich-anmeldung", "source-oesterreich-meldebestaetigung"],
          warningIds: ["warning-no-document-verification"],
          restrictionIds: ["restriction-no-document-storage"],
        },
      ],
      requirements: [
        {
          id: "data-new-address",
          kind: "data",
          title: "Адрес нового жилья",
          description:
            "Нужен для определения компетентного органа и заполнения Meldezettel.",
          usedInStepIds: [
            "step-check-registration-need",
            "step-determine-wohnsitz-and-authority",
            "step-prepare-meldezettel",
            "step-choose-submission-method",
          ],
        },
        {
          id: "data-factual-move-in-date",
          kind: "data",
          title: "Дата фактического въезда",
          description: "Нужна для понимания срока Anmeldung.",
          usedInStepIds: ["step-check-registration-need", "step-choose-submission-method"],
        },
        {
          id: "data-existing-registration-context",
          kind: "data",
          title: "Наличие уже существующей регистрации в Австрии",
          description:
            "Помогает понять, идет ли речь о первой регистрации, переезде или дополнительном Wohnsitz.",
          usedInStepIds: ["step-check-registration-need"],
        },
        {
          id: "data-municipality",
          kind: "data",
          title: "Город или Gemeinde нового жилья",
          description:
            "Нужны для определения Meldebehoerde и проверки местных требований.",
          usedInStepIds: ["step-determine-wohnsitz-and-authority"],
        },
        {
          id: "data-wohnsitz-type",
          kind: "data",
          title: "Тип Wohnsitz",
          description:
            "Hauptwohnsitz или weiterer Wohnsitz / Nebenwohnsitz; пользователь проверяет применимость.",
          usedInStepIds: ["step-determine-wohnsitz-and-authority"],
          verificationNote:
            "Nova Agent не определяет Mittelpunkt der Lebensbeziehungen за пользователя.",
        },
        {
          id: "data-previous-main-residence",
          kind: "data",
          title: "Сведения о прежнем Hauptwohnsitz",
          description:
            "Могут понадобиться, если пользователь меняет основной адрес.",
          usedInStepIds: ["step-determine-wohnsitz-and-authority"],
        },
        {
          id: "document-meldezettel",
          kind: "document",
          title: "Meldezettel",
          description:
            "Для каждой персоны отдельный Meldezettel, подписанный нужными сторонами.",
          usedInStepIds: ["step-prepare-meldezettel", "step-choose-submission-method"],
          verificationNote:
            "Требования к форме нужно проверять в официальном источнике.",
        },
        {
          id: "data-user-personal-details",
          kind: "data",
          title: "Данные пользователя для Meldezettel",
          description:
            "Личные данные, необходимые для заполнения формы. В seed content это требование, а не заполненное пользовательское значение.",
          usedInStepIds: ["step-prepare-meldezettel"],
        },
        {
          id: "document-unterkunftgeber-signature",
          kind: "document",
          title: "Подпись Unterkunftgeber",
          description:
            "Требуется на Meldezettel и зависит от ситуации проживания.",
          usedInStepIds: ["step-prepare-meldezettel"],
        },
        {
          id: "document-passport-or-travel-document",
          kind: "document",
          title: "Reisedokument / паспорт",
          description: "Особенно важно для иностранных граждан.",
          usedInStepIds: ["step-prepare-identity-documents", "step-choose-submission-method"],
        },
        {
          id: "document-birth-certificate-or-public-record",
          kind: "document",
          title: "Geburtsurkunde или публичная Urkunde с личными данными",
          description:
            "Требования нужно проверять в официальном источнике.",
          usedInStepIds: ["step-prepare-identity-documents"],
        },
        {
          id: "document-minors-or-representatives",
          kind: "document",
          title: "Дополнительные документы для Minderjaehrige или Vertreter",
          description:
            "Только если применимо; требует официальной проверки.",
          usedInStepIds: ["step-prepare-identity-documents"],
        },
        {
          id: "document-housing-proof-if-requested",
          kind: "document",
          title: "Mietvertrag, Kaufvertrag, Grundbuchauszug или другое подтверждение жилья",
          description:
            "Может потребоваться дополнительно; не считать универсально обязательным.",
          usedInStepIds: ["step-prepare-identity-documents"],
        },
        {
          id: "data-submission-method",
          kind: "data",
          title: "Выбранный способ обращения",
          description:
            "Личная подача, почта, Bote или официальный онлайн-сервис, если применим.",
          usedInStepIds: ["step-choose-submission-method"],
        },
        {
          id: "data-id-austria-or-eu-login",
          kind: "data",
          title: "ID Austria или EU Login",
          description:
            "Только если пользователь проверил применимость онлайн-сервиса.",
          usedInStepIds: ["step-choose-submission-method"],
        },
        {
          id: "data-external-contact-fact",
          kind: "data",
          title: "Факт внешнего обращения",
          description:
            "Пользовательский контекст о том, что внешнее обращение было выполнено. Не является официальным статусом Nova Agent.",
          usedInStepIds: ["step-receive-confirmation-and-record-progress"],
        },
        {
          id: "document-meldebestaetigung-reference",
          kind: "document",
          title: "Bestaetigung der Meldung / Meldebestaetigung",
          description:
            "Упоминается как внешнее подтверждение после регистрации. MVP не хранит этот документ как файл.",
          usedInStepIds: ["step-receive-confirmation-and-record-progress"],
        },
        {
          id: "data-questions-for-meldebehoerde",
          kind: "data",
          title: "Вопросы для Meldebehoerde",
          description:
            "Вопросы, которые пользователь должен уточнить у компетентного органа.",
          usedInStepIds: ["step-receive-confirmation-and-record-progress"],
        },
        {
          id: "data-checked-source-context",
          kind: "data",
          title: "Источник, который пользователь проверял",
          description:
            "Контекст для будущего пользовательского процесса; в Step 1 это только content requirement без пользовательской отметки источника.",
          usedInStepIds: ["step-receive-confirmation-and-record-progress"],
        },
      ],
      sources: [
        {
          id: "source-oesterreich-anmeldung",
          type: "official",
          title:
            'oesterreich.gv.at: Anmeldung eines neuen Hauptwohnsitzes oder "Nebenwohnsitzes"',
          url: "https://www.oesterreich.gv.at/de/themen/persoenliche_dokumente_und_bestaetigungen/an__abmeldung_des_wohnsitzes/Seite.1180200",
          usage:
            "Основной федеральный источник для условий, сроков, органа, процедуры, документов и формы.",
          checkCurrentness: true,
        },
        {
          id: "source-oesterreich-wohnsitz-types",
          type: "official",
          title:
            'oesterreich.gv.at: Hauptwohnsitz/weiterer Wohnsitz ("Nebenwohnsitz")',
          url: "https://www.oesterreich.gv.at/de/themen/persoenliche_dokumente_und_bestaetigungen/an__abmeldung_des_wohnsitzes/Seite.1180230",
          usage:
            "Понимание Hauptwohnsitz, Nebenwohnsitz и Mittelpunkt der Lebensbeziehungen.",
          checkCurrentness: true,
        },
        {
          id: "source-stadt-wien-anmelden",
          type: "official",
          title: "Stadt Wien: Anmelden eines Wohnsitzes",
          url: "https://www.wien.gv.at/amtswege/anmelden-wohnsitz",
          usage:
            "Городской пример для Вены: Meldeservice, сроки, документы, исключения, процедура.",
          checkCurrentness: true,
        },
        {
          id: "source-ris-meldegesetz",
          type: "official",
          title: "RIS: Meldegesetz 1991",
          url: "https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10005799",
          usage:
            "Правовая основа; использовать как направление проверки, не как юридическую консультацию.",
          checkCurrentness: true,
        },
        {
          id: "source-meldezettel-form",
          type: "official",
          title: "Meldezettel form via oesterreich.gv.at",
          url: "https://www.oesterreich.gv.at/de/themen/persoenliche_dokumente_und_bestaetigungen/an__abmeldung_des_wohnsitzes/Seite.1180200",
          usage: 'Форма Meldezettel доступна через раздел "Zum Formular".',
          checkCurrentness: true,
        },
        {
          id: "source-oesterreich-meldebestaetigung",
          type: "official",
          title: "oesterreich.gv.at: Meldebestaetigung",
          url: "https://www.oesterreich.gv.at/de/themen/persoenliche_dokumente_und_bestaetigungen/an__abmeldung_des_wohnsitzes/Seite.1180300",
          usage:
            "Понимание Bestaetigung der Meldung / Meldebestaetigung как внешнего подтверждения, не как результата Nova Agent.",
          checkCurrentness: true,
        },
      ],
      templateOpenQuestions: [
        {
          id: "toq-main-or-secondary-residence",
          text: "Нужно ли мне регистрировать Hauptwohnsitz или weiteren Wohnsitz / Nebenwohnsitz?",
          relatedSourceIds: ["source-oesterreich-wohnsitz-types"],
        },
        {
          id: "toq-competent-authority",
          text: "Какая Meldebehoerde компетентна для моего адреса?",
          relatedSourceIds: ["source-oesterreich-anmeldung", "source-stadt-wien-anmelden"],
        },
        {
          id: "toq-online-or-in-person",
          text: "Подходит ли мне онлайн-регистрация или нужна личная, почтовая подача либо Bote?",
          relatedSourceIds: ["source-oesterreich-anmeldung"],
        },
        {
          id: "toq-unterkunftgeber-signature",
          text: "Кто в моей ситуации должен подписать Meldezettel как Unterkunftgeber?",
          relatedSourceIds: ["source-oesterreich-anmeldung", "source-meldezettel-form"],
        },
        {
          id: "toq-citizenship-specific-documents",
          text: "Какие документы нужны именно для моей Staatsbuergerschaft и моей ситуации?",
          relatedSourceIds: ["source-oesterreich-anmeldung"],
        },
        {
          id: "toq-special-cases-documents",
          text: "Нужны ли дополнительные документы для ребенка, взрослого с представительством или другого особого случая?",
          relatedSourceIds: ["source-oesterreich-anmeldung"],
        },
        {
          id: "toq-residence-law",
          text: "Нужно ли отдельно решать Aufenthaltsrecht, если я не гражданин Австрии?",
          relatedSourceIds: ["source-oesterreich-anmeldung"],
        },
        {
          id: "toq-local-differences",
          text: "Какие требования моего города или Gemeinde отличаются от федерального описания?",
          relatedSourceIds: ["source-oesterreich-anmeldung", "source-stadt-wien-anmelden"],
        },
      ],
    },
  ],
} as const;
