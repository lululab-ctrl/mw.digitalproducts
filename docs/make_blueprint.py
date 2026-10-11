"""Builds the Make blueprint for the MWP Digital Shop events scenario.
Usage: python3 make_blueprint.py <monday_connection_id> > blueprint.json
"""
import json, sys

CONN = int(sys.argv[1])
HOOK = 3879124
MATAN = 104260573

B_ORD, B_CUS, B_PRD, B_SUP = 5105799198, 5105799189, 5105799186, 5105799201

# Free text that ends up inside a JSON string: strip quotes, backslashes and line breaks.
def clean(expr):
    return "{{replace(" + expr + "; /[\"\\\\\\r\\n]/g; \"\")}}"

def gql(mid, query, variables, name=None, filt=None):
    m = {
        "id": mid, "module": "monday:ExecuteGraphQLQueryV2", "version": 2,
        "parameters": {"__IMTCONN__": CONN},
        "mapper": {"method": "POST", "queryBody": query, "variablesDataSource": "array",
                   "variables": [{"key": k, "value": v} for k, v in variables.items()]},
        "metadata": {"designer": {"x": 0, "y": 0, **({"name": name} if name else {})}},
    }
    if filt:
        m["filter"] = filt
    return m

def f(name, *conds):
    return {"name": name, "conditions": [[{"a": a, "o": o, **({"b": b} if b is not None else {})} for a, o, b in conds]]}

def router(mid, routes):
    return {"id": mid, "module": "builtin:BasicRouter", "version": 1, "mapper": None,
            "metadata": {"designer": {"x": 0, "y": 0}}, "routes": [{"flow": r} for r in routes]}

TODAY = "{{formatDate(now; \"YYYY-MM-DD\")}}"

# ---------------------------------------------------------------- order
q_order_lookup = """query ($email: String!, $slug: String!, $lsid: String!) {
  cust: items_page_by_column_values(board_id: %d, limit: 1, columns: [{column_id: "email_mm80mvf8", column_values: [$email]}]) { items { id column_values(ids: ["color_mm806z0h"]) { text } } }
  prod: items_page_by_column_values(board_id: %d, limit: 1, columns: [{column_id: "text_mm80txve", column_values: [$slug]}]) { items { id } }
  dup: items_page_by_column_values(board_id: %d, limit: 1, columns: [{column_id: "text_mm806h06", column_values: [$lsid]}]) { items { id } }
}""" % (B_CUS, B_PRD, B_ORD)

order_cv = (
    '{"color_mm80k318":{"label":"{{1.status_label}}"},'
    '"text_mm801m2":"{{1.order_number}}",'
    '"date_mm80g3kg":{"date":"{{1.order_date}}"},'
    '"board_relation_mm80229m":{"item_ids":[{{3.body.data.prod.items[1].id}}]},'
    '"email_mm80d5sm":{"email":"{{1.email}}","text":"{{1.email}}"},'
    '"numeric_mm807h7g":"{{1.subtotal}}","numeric_mm80drf4":"{{1.discount}}",'
    '"numeric_mm80y605":"{{1.tax}}","numeric_mm80a9g":"{{1.total}}",'
    '"text_mm80seb":"{{1.currency}}",'
    '"link_mm80xyay":{"url":"{{1.receipt_url}}","text":"Receipt"},'
    '"text_mm80svyn":"{{1.source}}",'
    '"text_mm806h06":"{{1.checkout_order_id}}"}'
)
# Make reads \" inside {{ }} poorly; use plain quotes there instead.
order_cv = order_cv.replace('\\"', '"')

q_create = "mutation ($name: String!, $group: String!, $cv: JSON!) { create_item(board_id: %d, group_id: $group, item_name: $name, column_values: $cv) { id } }"

new_customer_cv = (
    '{"email_mm80mvf8":{"email":"{{1.email}}","text":"{{1.email}}"},'
    '"date_mm80eahk":{"date":"{{1.order_date}}"},"date_mm80h8hh":{"date":"{{1.order_date}}"},'
    '"color_mm806z0h":{"label":"New"},"color_mm801rf2":{"label":"Not subscribed"},'
    '"board_relation_mm80ww7m":{"item_ids":[{{4.body.data.create_item.id}}]}}'
)
q_existing = """mutation ($cid: ID!, $oid: ID!, $ccv: JSON!, $ocv: JSON!) {
  c: change_multiple_column_values(board_id: %d, item_id: $cid, column_values: $ccv) { id }
  o: change_multiple_column_values(board_id: %d, item_id: $oid, column_values: $ocv) { id }
}""" % (B_CUS, B_ORD)
existing_ccv = ('{"date_mm80h8hh":{"date":"{{1.order_date}}"},'
                '"color_mm806z0h":{"label":"{{switch(3.body.data.cust.items[1].column_values[1].text; "VIP"; "VIP"; "Repeat")}}"}}')
existing_ocv = '{"board_relation_mm80b7mg":{"item_ids":[{{3.body.data.cust.items[1].id}}]}}'

order_route = [
    gql(3, q_order_lookup, {"email": "{{1.email}}", "slug": "{{1.product_slug}}", "lsid": "{{1.checkout_order_id}}"},
        "Find customer, product and duplicate order",
        f("Order", ("{{1.type}}", "text:equal", "order"))),
    gql(4, q_create % B_ORD, {"name": "#{{1.order_number}} · {{1.product}}",
                              "group": '{{switch(1.status_label; "Test order"; "group_mm80apq3"; "topics")}}', "cv": order_cv},
        "Create order", f("Not logged yet", ("{{3.body.data.dup.items[1].id}}", "notexist", None))),
    router(5, [
        [gql(6, q_create % B_CUS, {"name": "{{ifempty(" + "1.name; 1.email)}}", "group": "topics", "cv": new_customer_cv},
             "New customer (linked to order)", f("New customer", ("{{3.body.data.cust.items[1].id}}", "notexist", None)))],
        [gql(7, q_existing, {"cid": "{{3.body.data.cust.items[1].id}}", "oid": "{{4.body.data.create_item.id}}",
                             "ccv": existing_ccv, "ocv": existing_ocv},
             "Returning customer: link and update", f("Returning customer", ("{{3.body.data.cust.items[1].id}}", "exist", None)))],
    ]),
]

# ---------------------------------------------------------------- refund
q_find_order = """query ($lsid: String!) {
  o: items_page_by_column_values(board_id: %d, limit: 1, columns: [{column_id: "text_mm806h06", column_values: [$lsid]}]) { items { id } }
}""" % B_ORD
q_change = "mutation ($id: ID!, $cv: JSON!) { change_multiple_column_values(board_id: %d, item_id: $id, column_values: $cv) { id } }"
refund_cv = ('{"color_mm80k318":{"label":"{{switch(1.type; "refund"; "Refunded"; "Partially refunded")}}"},'
             '"numeric_mm80vsjk":"{{1.refunded_amount}}"}')
refund_route = [
    gql(8, q_find_order, {"lsid": "{{1.checkout_order_id}}"}, "Find refunded order",
        f("Refund", ("{{1.type}}", "text:contain", "refund"))),
    gql(9, q_change % B_ORD, {"id": "{{8.body.data.o.items[1].id}}", "cv": refund_cv}, "Mark order refunded",
        f("Order found", ("{{8.body.data.o.items[1].id}}", "exist", None))),
]

# ---------------------------------------------------------------- support
q_support_lookup = """query ($email: String!, $num: String!) {
  cust: items_page_by_column_values(board_id: %d, limit: 1, columns: [{column_id: "email_mm80mvf8", column_values: [$email]}]) { items { id } }
  ord: items_page_by_column_values(board_id: %d, limit: 1, columns: [{column_id: "text_mm801m2", column_values: [$num]}]) { items { id } }
}""" % (B_CUS, B_ORD)
TYPE = '{{switch(1.category; "download"; "Download problem"; "install"; "How-to question"; "refund"; "Refund request"; "Other")}}'
ticket_cv = (
    '{"color_mm808sp9":{"label":"{{switch(1.category; "refund"; "Needs Matan"; "New")}}"},'
    '"color_mm80qy4a":{"label":"' + TYPE + '"},'
    '"email_mm8082vk":{"email":"{{1.email}}","text":"{{1.email}}"},'
    '"board_relation_mm80aes6":{"item_ids":[{{10.body.data.cust.items[1].id}}]},'
    '"board_relation_mm80hvrq":{"item_ids":[{{10.body.data.ord.items[1].id}}]},'
    '"date_mm806h2f":{"date":"' + TODAY + '"},'
    '"text_mm80cye9":"{{1.ticket_id}}"}'
)
q_update = "mutation ($id: ID!, $body: String!) { create_update(item_id: $id, body: $body) { id } }"
support_body = "{{1.message_html}}"

q_notify = "mutation ($id: ID!, $text: String!) { create_notification(user_id: %d, target_id: $id, text: $text, target_type: Project) { text } }" % MATAN
support_route = [
    gql(10, q_support_lookup, {"email": "{{1.email}}", "num": "{{ifempty(1.order_number; \"-\")}}"}, "Find customer and order",
        f("Support", ("{{1.type}}", "text:equal", "support"))),
    gql(11, q_create % B_SUP, {"name": "{{1.subject}}", "group": "topics", "cv": ticket_cv}, "Create support ticket"),
    gql(12, q_update, {"id": "{{11.body.data.create_item.id}}", "body": support_body}, "Add the message"),
    gql(13, q_notify, {"id": "{{11.body.data.create_item.id}}",
                       "text": "Refund request in shop support from {{1.email}}: {{1.subject}}. Only you can approve refunds."},
        "Tell Matan about refund requests", f("Refund request", ("{{1.category}}", "text:equal", "refund"))),
]

# ---------------------------------------------------------------- newsletter sign-up
q_find_cust = """query ($email: String!) {
  cust: items_page_by_column_values(board_id: %d, limit: 1, columns: [{column_id: "email_mm80mvf8", column_values: [$email]}]) { items { id } }
}""" % B_CUS
subscribe_route = [
    gql(14, q_find_cust, {"email": "{{1.email}}"}, "Find customer",
        f("Sign-up", ("{{1.type}}", "text:equal", "subscribe"))),
    router(15, [
        [gql(16, q_change % B_CUS, {"id": "{{14.body.data.cust.items[1].id}}", "cv": '{"color_mm801rf2":{"label":"Subscribed"}}'},
             "Mark subscribed", f("Known", ("{{14.body.data.cust.items[1].id}}", "exist", None)))],
        [gql(17, q_create % B_CUS, {"name": "{{1.email}}", "group": "topics",
                                    "cv": '{"email_mm80mvf8":{"email":"{{1.email}}","text":"{{1.email}}"},'
                                          '"color_mm801rf2":{"label":"Subscribed"},"dropdown_mm80egg7":{"labels":["Newsletter"]}}'},
             "New subscriber", f("New", ("{{14.body.data.cust.items[1].id}}", "notexist", None)))],
    ]),
]

blueprint = {
    "name": "MWP Shop · Events to monday (orders, refunds, support, sign-ups)",
    "flow": [
        {"id": 1, "module": "gateway:CustomWebHook", "version": 1,
         "parameters": {"hook": HOOK, "maxResults": 1}, "mapper": {},
         "metadata": {"designer": {"x": 0, "y": 0}}},
        router(2, [order_route, refund_route, support_route, subscribe_route]),
    ],
    "metadata": {"version": 1, "scenario": {"roundtrips": 1, "maxErrors": 3, "autoCommit": True, "sequential": True,
                                            "confidential": False, "dataloss": False, "dlq": True}},
}

# lay modules out left to right so the editor shows a readable map
def layout(flow, x=0, y=0):
    for m in flow:
        m["metadata"]["designer"].update({"x": x, "y": y})
        if m.get("routes"):
            for i, r in enumerate(m["routes"]):
                layout(r["flow"], x + 300, y + i * 300)
        x += 300
layout(blueprint["flow"])

print(json.dumps(blueprint, ensure_ascii=False, indent=1))
