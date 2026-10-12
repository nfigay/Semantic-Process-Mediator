<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
 xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
 xmlns:xmi="http://www.omg.org/spec/XMI/20131001"
 xmlns:ea="http://www.sparxsystems.com/profiles/BPMN2.0/1.5"
 xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
 xmlns:xs="http://www.w3.org/2001/XMLSchema"
 xmlns:f="urn:bpmnsm:ea-xslt:functions"
 xmlns:map="http://www.w3.org/2005/xpath-functions/map"
 xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
 xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
 xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
 exclude-result-prefixes="xmi ea xs f map">
 <xsl:output method="xml" indent="yes" encoding="UTF-8"/>
 <xsl:key name="by-id" match="*[@xmi:id]" use="@xmi:id"/>
 <xsl:key name="stereotype-by-base" match="ea:*" use="(@base_Activity,@base_SendSignalAction,@base_Decision)"/>
  <!-- PERF-02: indexed UML partition membership references. -->
  <xsl:key name="partition-member-by-ref" match="*[@xmi:idref or @idref or @ref][local-name()=('node','packagedElement','subpartition')]" use="(@xmi:idref,@idref,@ref)"/>
  <!-- PERF-02: index EA data associations by UML Dependency endpoints. -->
  <xsl:key name="input-association-by-task" match="ea:DataInputAssociation" use="key('by-id',string(@base_Dependency),root(.))[@xmi:type='uml:Dependency'][1]/@supplier"/>
  <xsl:key name="output-association-by-task" match="ea:DataOutputAssociation" use="key('by-id',string(@base_Dependency),root(.))[@xmi:type='uml:Dependency'][1]/@client"/>
  <xsl:key name="data-object-by-artifact" match="ea:DataObject" use="@base_Artifact"/>
  <xsl:key name="data-store-by-artifact" match="ea:DataStore" use="@base_Artifact"/>
 <xsl:function name="f:ea-name" as="xs:string">
  <xsl:param name="semantic" as="element()?"/>
  <xsl:param name="stereotype" as="element()?"/>
  <xsl:sequence select="string((($semantic/@name)[normalize-space(.)], ($stereotype/@name)[normalize-space(.)])[1])"/>
 </xsl:function>
 <xsl:function name="f:owner" as="element()?">
  <xsl:param name="object" as="element()"/>
  <xsl:sequence select="($object/ancestor::*[@xmi:id][key('stereotype-by-base',string(@xmi:id),root($object))[self::ea:BusinessProcess or self::ea:CollaborationModel]])[last()]"/>
 </xsl:function>
 <xsl:function name="f:semantic" as="element()?">
  <xsl:param name="reference" as="xs:string"/>
  <xsl:param name="doc" as="node()"/>
  <xsl:sequence select="key('by-id',$reference,$doc)[@xmi:type=('uml:Activity','uml:SendSignalAction','uml:DecisionNode')][1]"/>
 </xsl:function>
 <xsl:function name="f:bpmn-id" as="xs:string">
  <xsl:param name="object" as="element()"/>
  <xsl:sequence select="concat('EA_',string($object/@xmi:id))"/>
 </xsl:function>
 <xsl:function name="f:pools-for" as="element()*">
  <xsl:param name="node" as="element()"/>
  <xsl:param name="doc" as="node()"/>
  <xsl:for-each select="$doc//ea:Pool">
   <xsl:variable name="pool" select="key('by-id',string(@base_ActivityPartition),$doc)[@xmi:type='uml:ActivityPartition'][1]"/>
   <xsl:if test="$pool and ((some $a in $node/ancestor::* satisfies $a is $pool) or exists(key('partition-member-by-ref',string($node/@xmi:id),$doc)[ancestor::*[. is $pool]]))">
    <xsl:sequence select="$pool"/>
   </xsl:if>
  </xsl:for-each>
 </xsl:function>
 <xsl:function name="f:unique-pool" as="element()?">
  <xsl:param name="node" as="element()"/>
  <xsl:param name="doc" as="node()"/>
  <xsl:variable name="pools" select="f:pools-for($node,$doc)"/>
  <xsl:sequence select="if (count($pools)=1) then $pools[1] else ()"/>
 </xsl:function>
 <xsl:function name="f:participant-for-node" as="element()?">
  <xsl:param name="node" as="element()"/>
  <xsl:param name="doc" as="node()"/>
  <xsl:variable name="pool" select="f:unique-pool($node,$doc)"/>
  <xsl:choose>
   <xsl:when test="$pool"><xsl:sequence select="$pool"/></xsl:when>
   <xsl:otherwise>
    <xsl:variable name="owner" select="f:owner($node)"/>
    <xsl:variable name="matches" as="element()*">
     <xsl:for-each select="$doc//ea:Pool[normalize-space(@processRef)]">
      <xsl:variable name="process" select="key('by-id',string(@processRef),$doc)[@xmi:type='uml:Activity'][1]"/>
      <xsl:if test="$owner and $process and $owner is $process">
       <xsl:sequence select="key('by-id',string(@base_ActivityPartition),$doc)[@xmi:type='uml:ActivityPartition'][1]"/>
      </xsl:if>
     </xsl:for-each>
    </xsl:variable>
    <xsl:sequence select="if (count($matches)=1) then $matches[1] else ()"/>
   </xsl:otherwise>
  </xsl:choose>
 </xsl:function>

 <!-- EA-DATA-011: local references to UML artifacts used by activities in this process. -->
 <xsl:template name="emit-data-for-process">
  <xsl:param name="nodes" as="element()*"/>
  <xsl:param name="doc" as="node()"/>
  <xsl:param name="pid" as="xs:string"/>
  <xsl:variable name="usages" as="element()*">
   <xsl:for-each select="$doc//ea:DataInputAssociation | $doc//ea:DataOutputAssociation">
    <xsl:variable name="d" select="key('by-id',string(@base_Dependency),$doc)[@xmi:type='uml:Dependency'][1]"/>
    <xsl:variable name="aid" select="if (self::ea:DataInputAssociation) then string($d/@supplier) else string($d/@client)"/>
    <xsl:variable name="dataid" select="if (self::ea:DataInputAssociation) then string($d/@client) else string($d/@supplier)"/>
    <xsl:variable name="artifact" select="key('by-id',$dataid,$doc)[@xmi:type='uml:Artifact'][1]"/>
    <xsl:if test="$d and $artifact and exists($nodes[@xmi:id=$aid]) and exists(key('data-object-by-artifact',$dataid,$doc) | key('data-store-by-artifact',$dataid,$doc))">
     <xsl:sequence select="$artifact"/>
    </xsl:if>
   </xsl:for-each>
  </xsl:variable>
  <xsl:for-each-group select="$usages" group-by="string(@xmi:id)">
   <xsl:variable name="artifact" select="current-group()[1]"/>
   <xsl:choose>
    <xsl:when test="exists(key('data-store-by-artifact',string($artifact/@xmi:id),$doc))">
     <bpmn:dataStoreReference id="{concat('EA_DATAREF_',string($artifact/@xmi:id),'_', $pid)}" dataStoreRef="{concat('EA_',string($artifact/@xmi:id))}"/>
    </xsl:when>
    <xsl:otherwise>
     <bpmn:dataObject id="{concat('EA_DATAOBJ_',string($artifact/@xmi:id),'_', $pid)}"/>
     <bpmn:dataObjectReference id="{concat('EA_DATAREF_',string($artifact/@xmi:id),'_', $pid)}" dataObjectRef="{concat('EA_DATAOBJ_',string($artifact/@xmi:id),'_', $pid)}"/>
    </xsl:otherwise>
   </xsl:choose>
  </xsl:for-each-group>
 </xsl:template>
 <xsl:template name="emit-task-data">
  <xsl:param name="task" as="element()"/>
  <xsl:param name="doc" as="node()"/>
  <xsl:param name="pid" as="xs:string"/>
  <xsl:variable name="incoming" select="key('input-association-by-task',string($task/@xmi:id),$doc)"/>
  <xsl:variable name="outgoing" select="key('output-association-by-task',string($task/@xmi:id),$doc)"/>
  <xsl:if test="exists($incoming | $outgoing)">
   <bpmn:ioSpecification>
    <xsl:for-each select="$incoming"><bpmn:dataInput id="{concat('EA_IO_',string(@base_Dependency))}"/></xsl:for-each>
    <xsl:for-each select="$outgoing"><bpmn:dataOutput id="{concat('EA_IO_',string(@base_Dependency))}"/></xsl:for-each>
    <bpmn:inputSet id="{concat('EA_INPUTSET_',string($task/@xmi:id))}">
     <xsl:for-each select="$incoming"><bpmn:dataInputRefs><xsl:value-of select="concat('EA_IO_',string(@base_Dependency))"/></bpmn:dataInputRefs></xsl:for-each>
    </bpmn:inputSet>
    <bpmn:outputSet id="{concat('EA_OUTPUTSET_',string($task/@xmi:id))}">
     <xsl:for-each select="$outgoing"><bpmn:dataOutputRefs><xsl:value-of select="concat('EA_IO_',string(@base_Dependency))"/></bpmn:dataOutputRefs></xsl:for-each>
    </bpmn:outputSet>
   </bpmn:ioSpecification>
   <xsl:for-each select="$incoming">
    <xsl:variable name="d" select="key('by-id',string(@base_Dependency),$doc)[@xmi:type='uml:Dependency'][1]"/>
    <bpmn:dataInputAssociation id="{concat('EA_',string($d/@xmi:id))}">
     <bpmn:sourceRef><xsl:value-of select="concat('EA_DATAREF_',string($d/@client),'_',$pid)"/></bpmn:sourceRef>
     <bpmn:targetRef><xsl:value-of select="concat('EA_IO_',string($d/@xmi:id))"/></bpmn:targetRef>
    </bpmn:dataInputAssociation>
   </xsl:for-each>
   <xsl:for-each select="$outgoing">
    <xsl:variable name="d" select="key('by-id',string(@base_Dependency),$doc)[@xmi:type='uml:Dependency'][1]"/>
    <bpmn:dataOutputAssociation id="{concat('EA_',string($d/@xmi:id))}">
     <bpmn:sourceRef><xsl:value-of select="concat('EA_IO_',string($d/@xmi:id))"/></bpmn:sourceRef>
     <bpmn:targetRef><xsl:value-of select="concat('EA_DATAREF_',string($d/@supplier),'_',$pid)"/></bpmn:targetRef>
    </bpmn:dataOutputAssociation>
   </xsl:for-each>
  </xsl:if>
 </xsl:template>

 <xsl:template name="ea-semantic">
  <xsl:variable name="doc" select="."/>
  <xsl:variable name="processes" select="//ea:BusinessProcess"/>
  <xsl:variable name="collaborations" select="//ea:CollaborationModel"/>
  <xsl:variable name="activities" select="//ea:Activity"/>
  <xsl:variable name="events" select="//ea:StartEvent | //ea:EndEvent | //ea:IntermediateEvent"/>
  <xsl:variable name="gateways" select="//ea:Gateway"/>
  <xsl:variable name="sequences" select="//ea:SequenceFlow"/>
  <xsl:variable name="pools" select="//ea:Pool"/>
  <xsl:variable name="owned" select="$activities[exists(key('by-id',string(@base_Activity),$doc)[f:owner(.)][key('stereotype-by-base',string(f:owner(.)/@xmi:id),$doc)[self::ea:BusinessProcess]])]"/>
  <xsl:message select="'EA-XSLT-11: processes=',count($processes),' collaborations=',count($collaborations),' tasks-in-process=',count($owned),' tasks-deferred=',count($activities)-count($owned)"/>
  <bpmn:definitions id="Definitions_EA_XSLT_07" targetNamespace="urn:bpmnsm:ea-xslt:experimental" exporter="BPMNSM EA-XSLT-11" exporterVersion="0.3">
    <xsl:message select="'PERF-02 BEGIN data-stores'"/>
   <xsl:for-each select="//ea:DataStore">
    <xsl:variable name="artifact" select="key('by-id',string(@base_Artifact),$doc)[@xmi:type='uml:Artifact'][1]"/>
    <xsl:if test="$artifact"><bpmn:dataStore id="{f:bpmn-id($artifact)}"/></xsl:if>
   </xsl:for-each>
    <xsl:message select="'PERF-02 END data-stores'"/>
    <xsl:message select="'PERF-02 BEGIN business-processes'"/>
   <xsl:for-each select="$processes">
    <xsl:variable name="source" select="key('by-id',string(@base_Activity),$doc)[self::packagedElement][@xmi:type='uml:Activity'][1]"/>
    <xsl:if test="$source">
     <bpmn:process id="{concat('EA_',string($source/@xmi:id))}" isExecutable="false">
      <xsl:if test="f:ea-name($source,.)"><xsl:attribute name="name" select="f:ea-name($source,.)"/></xsl:if>
      <xsl:variable name="process-tasks" select="$activities/key('by-id',string(@base_Activity),$doc)[@xmi:type='uml:Activity'][f:owner(.) is $source]"/>
      <xsl:call-template name="emit-data-for-process"><xsl:with-param name="nodes" select="$process-tasks"/><xsl:with-param name="doc" select="$doc"/><xsl:with-param name="pid" select="f:bpmn-id($source)"/></xsl:call-template>
      <xsl:for-each select="$owned">
       <xsl:variable name="task" select="key('by-id',string(@base_Activity),$doc)[self::packagedElement][@xmi:type='uml:Activity'][1]"/>
       <xsl:if test="$task and f:owner($task) is $source">
        <xsl:variable name="tag" select="if (@taskType='User') then 'userTask' else if (@taskType='Manual') then 'manualTask' else if (@taskType='Service') then 'serviceTask' else 'task'"/>
        <xsl:element name="bpmn:{$tag}">
         <xsl:attribute name="id" select="concat('EA_',string($task/@xmi:id))"/>
         <xsl:if test="$task/@name"><xsl:attribute name="name" select="$task/@name"/></xsl:if>
         <xsl:call-template name="emit-task-data"><xsl:with-param name="task" select="$task"/><xsl:with-param name="doc" select="$doc"/><xsl:with-param name="pid" select="f:bpmn-id($source)"/></xsl:call-template>
        </xsl:element>
       </xsl:if>
      </xsl:for-each>
      <!-- EA-CALL-01: preserve UML CallBehaviorAction nodes owned by this process.
           Do not set calledElement when the UML behavior maps to a collaboration:
           BPMN callActivity.calledElement must reference a callable element. -->
      <xsl:for-each select="$source//*[@xmi:type='uml:CallBehaviorAction'][@xmi:id]">
       <xsl:variable name="call" select="."/>
       <xsl:variable name="behavior" select="key('by-id',string((behavior/@xmi:idref,@behavior)[1]),$doc)[1]"/>
       <bpmn:callActivity id="{f:bpmn-id($call)}">
        <xsl:if test="($call/@name,$behavior/@name)[normalize-space(.)]">
         <xsl:attribute name="name" select="string(($call/@name,$behavior/@name)[normalize-space(.)][1])"/>
        </xsl:if>
        <xsl:if test="$behavior">
         <bpmn:documentation><xsl:value-of select="concat('EA UML behavior reference: ',string($behavior/@xmi:id))"/></bpmn:documentation>
        </xsl:if>
       </bpmn:callActivity>
      </xsl:for-each>
      <!-- Events: emit only for a known process owner. -->
      <xsl:for-each select="$events">
       <xsl:variable name="reference" select="string((@base_SendSignalAction)[1])"/>
       <xsl:variable name="event" select="f:semantic($reference,$doc)"/>
       <xsl:if test="$event and f:owner($event) is $source">
        <xsl:variable name="tag" select="if (self::ea:StartEvent) then 'startEvent' else if (self::ea:EndEvent) then 'endEvent' else if (@catchOrThrow='Catch') then 'intermediateCatchEvent' else 'intermediateThrowEvent'"/>
        <xsl:element name="bpmn:{$tag}">
         <xsl:attribute name="id" select="f:bpmn-id($event)"/>
         <xsl:if test="$event/@name"><xsl:attribute name="name" select="$event/@name"/></xsl:if>
         <xsl:choose>
          <xsl:when test="@eventDefinition='Message'"><bpmn:messageEventDefinition id="{concat(f:bpmn-id($event),'_message')}"/></xsl:when>
          <xsl:when test="@eventDefinition='Timer'"><bpmn:timerEventDefinition id="{concat(f:bpmn-id($event),'_timer')}"/></xsl:when>
         </xsl:choose>
        </xsl:element>
       </xsl:if>
      </xsl:for-each>
      <!-- Gateways -->
      <xsl:for-each select="$gateways">
       <xsl:variable name="gateway" select="f:semantic(string(@base_Decision),$doc)"/>
       <xsl:if test="$gateway and f:owner($gateway) is $source and @gatewayType=('Exclusive','Parallel')">
        <xsl:element name="bpmn:{if (@gatewayType='Parallel') then 'parallelGateway' else 'exclusiveGateway'}"><xsl:attribute name="id" select="f:bpmn-id($gateway)"/>
         <xsl:if test="f:ea-name($gateway,.)"><xsl:attribute name="name" select="f:ea-name($gateway,.)"/></xsl:if>
        </xsl:element>
       </xsl:if>
      </xsl:for-each>
      <!-- Only serialize sequence flows with typed UML endpoints in this process. -->
      <xsl:for-each select="$sequences">
       <xsl:variable name="flow" select="key('by-id',string(@base_ControlFlow),$doc)[@xmi:type='uml:ControlFlow'][1]"/>
       <xsl:variable name="from" select="if ($flow) then f:semantic(string($flow/@source),$doc) else ()"/>
       <xsl:variable name="to" select="if ($flow) then f:semantic(string($flow/@target),$doc) else ()"/>
       <xsl:if test="$flow and $from and $to and f:owner($flow) is $source and f:owner($from) is $source and f:owner($to) is $source">
        <bpmn:sequenceFlow id="{f:bpmn-id($flow)}" sourceRef="{f:bpmn-id($from)}" targetRef="{f:bpmn-id($to)}"><xsl:if test="f:ea-name($flow,.)"><xsl:attribute name="name" select="f:ea-name($flow,.)"/></xsl:if></bpmn:sequenceFlow>
       </xsl:if>
      </xsl:for-each>
     </bpmn:process>
    </xsl:if>
   </xsl:for-each>
   <!-- EA-PROC-001: synthetic processes only for pools with no processRef and unique node membership. -->
    <xsl:message select="'PERF-02 END business-processes'"/>
    <!-- PERF-03: resolve each semantic node's unique pool once for all synthetic processes and flows. -->
   <xsl:message select="'PERF-03 BEGIN pool-cache'"/>
   <xsl:variable name="candidate-nodes" as="element()*">
    <xsl:for-each select="$activities | $events | $gateways">
     <xsl:variable name="n" select="f:semantic(string((@base_Activity,@base_SendSignalAction,@base_Decision)[1]),$doc)"/>
     <xsl:if test="$n"><xsl:sequence select="$n"/></xsl:if>
    </xsl:for-each>
    <xsl:for-each select="$sequences">
     <xsl:variable name="flow" select="key('by-id',string(@base_ControlFlow),$doc)[@xmi:type='uml:ControlFlow'][1]"/>
     <xsl:if test="$flow">
      <xsl:sequence select="f:semantic(string($flow/@source),$doc), f:semantic(string($flow/@target),$doc)"/>
     </xsl:if>
    </xsl:for-each>
   </xsl:variable>
   <xsl:variable name="pool-cache" as="map(xs:string, element()*)">
    <xsl:map>
     <xsl:for-each-group select="$candidate-nodes" group-by="string(@xmi:id)">
      <xsl:map-entry key="current-grouping-key()" select="f:unique-pool(current-group()[1],$doc)"/>
     </xsl:for-each-group>
    </xsl:map>
   </xsl:variable>
   <xsl:message select="'PERF-03 END pool-cache: unique-nodes=', count(distinct-values($candidate-nodes/@xmi:id))"/>
   <xsl:message select="'PERF-03 BEGIN synthetic-processes'"/>
   <xsl:for-each select="$pools[not(normalize-space(@processRef))]">
    <xsl:variable name="pool" select="key('by-id',string(@base_ActivityPartition),$doc)[@xmi:type='uml:ActivityPartition'][1]"/>
    <xsl:if test="$pool and exists($activities | $events | $gateways)">
     <xsl:variable name="members" as="element()*">
      <xsl:for-each select="$activities | $events | $gateways">
       <xsl:variable name="ref" select="string((@base_Activity,@base_SendSignalAction,@base_Decision)[1])"/>
       <xsl:variable name="n" select="f:semantic($ref,$doc)"/>
       <xsl:if test="$n and f:owner($n) and key('stereotype-by-base',string(f:owner($n)/@xmi:id),$doc)[self::ea:CollaborationModel] and map:get($pool-cache,string($n/@xmi:id)) is $pool">
        <xsl:sequence select="."/>
       </xsl:if>
      </xsl:for-each>
     </xsl:variable>
     <xsl:if test="exists($members)">
      <bpmn:process id="{concat('EA_SYNTH_',string($pool/@xmi:id))}" isExecutable="false">
       <xsl:if test="$pool/@name"><xsl:attribute name="name" select="$pool/@name"/></xsl:if>
       <xsl:variable name="process-tasks" select="$members[self::ea:Activity]/key('by-id',string(@base_Activity),$doc)[@xmi:type='uml:Activity']"/>
       <xsl:call-template name="emit-data-for-process"><xsl:with-param name="nodes" select="$process-tasks"/><xsl:with-param name="doc" select="$doc"/><xsl:with-param name="pid" select="concat('EA_SYNTH_',string($pool/@xmi:id))"/></xsl:call-template>
       <xsl:for-each select="$members">
        <xsl:variable name="n" select="f:semantic(string((@base_Activity,@base_SendSignalAction,@base_Decision)[1]),$doc)"/>
        <xsl:choose>
         <xsl:when test="self::ea:Activity">
          <xsl:variable name="tag" select="if (@taskType='User') then 'userTask' else if (@taskType='Manual') then 'manualTask' else if (@taskType='Service') then 'serviceTask' else 'task'"/>
          <xsl:element name="bpmn:{$tag}"><xsl:attribute name="id" select="f:bpmn-id($n)"/><xsl:if test="$n/@name"><xsl:attribute name="name" select="$n/@name"/></xsl:if><xsl:call-template name="emit-task-data"><xsl:with-param name="task" select="$n"/><xsl:with-param name="doc" select="$doc"/><xsl:with-param name="pid" select="concat('EA_SYNTH_',string($pool/@xmi:id))"/></xsl:call-template></xsl:element>
         </xsl:when>
         <xsl:when test="self::ea:Gateway and @gatewayType=('Exclusive','Parallel')"><xsl:element name="bpmn:{if (@gatewayType='Parallel') then 'parallelGateway' else 'exclusiveGateway'}"><xsl:attribute name="id" select="f:bpmn-id($n)"/><xsl:if test="f:ea-name($n,.)"><xsl:attribute name="name" select="f:ea-name($n,.)"/></xsl:if></xsl:element></xsl:when>
         <xsl:when test="self::ea:StartEvent or self::ea:EndEvent or self::ea:IntermediateEvent">
          <xsl:variable name="tag" select="if (self::ea:StartEvent) then 'startEvent' else if (self::ea:EndEvent) then 'endEvent' else if (@catchOrThrow='Catch') then 'intermediateCatchEvent' else 'intermediateThrowEvent'"/>
          <xsl:element name="bpmn:{$tag}"><xsl:attribute name="id" select="f:bpmn-id($n)"/><xsl:if test="$n/@name"><xsl:attribute name="name" select="$n/@name"/></xsl:if><xsl:choose><xsl:when test="@eventDefinition='Message'"><bpmn:messageEventDefinition id="{concat(f:bpmn-id($n),'_message')}"/></xsl:when><xsl:when test="@eventDefinition='Timer'"><bpmn:timerEventDefinition id="{concat(f:bpmn-id($n),'_timer')}"/></xsl:when></xsl:choose></xsl:element>
         </xsl:when>
        </xsl:choose>
       </xsl:for-each>
       <xsl:for-each select="$sequences">
        <xsl:variable name="f" select="key('by-id',string(@base_ControlFlow),$doc)[@xmi:type='uml:ControlFlow'][1]"/>
        <xsl:variable name="a" select="if ($f) then f:semantic(string($f/@source),$doc) else ()"/>
        <xsl:variable name="b" select="if ($f) then f:semantic(string($f/@target),$doc) else ()"/>
        <xsl:if test="$f and $a and $b and map:get($pool-cache,string($a/@xmi:id)) is $pool and map:get($pool-cache,string($b/@xmi:id)) is $pool and key('stereotype-by-base',string(f:owner($f)/@xmi:id),$doc)[self::ea:CollaborationModel]">
         <bpmn:sequenceFlow id="{f:bpmn-id($f)}" sourceRef="{f:bpmn-id($a)}" targetRef="{f:bpmn-id($b)}"><xsl:if test="f:ea-name($f,.)"><xsl:attribute name="name" select="f:ea-name($f,.)"/></xsl:if></bpmn:sequenceFlow>
        </xsl:if>
       </xsl:for-each>
      </bpmn:process>
     </xsl:if>
    </xsl:if>
   </xsl:for-each>
    <xsl:message select="'PERF-03 END synthetic-processes'"/>
    <!-- FLOW-CONV-06: derive emitted synthetic targets using the SAME membership predicate as the process emitter. -->
    <xsl:variable name="emitted-synthetic-process-ids" as="xs:string*">
      <xsl:for-each select="$pools[not(normalize-space(@processRef))]">
        <xsl:variable name="pool" select="key('by-id',string(@base_ActivityPartition),$doc)[@xmi:type='uml:ActivityPartition'][1]"/>
        <xsl:if test="$pool and (some $st in ($activities | $events | $gateways) satisfies
          (let $n := f:semantic(string(($st/@base_Activity,$st/@base_SendSignalAction,$st/@base_Decision)[1]),$doc)
           return exists($n) and exists(f:owner($n)) and
             exists(key('stereotype-by-base',string(f:owner($n)/@xmi:id),$doc)[self::ea:CollaborationModel]) and
             (map:get($pool-cache,string($n/@xmi:id)) is $pool)))">
          <xsl:sequence select="concat('EA_SYNTH_',string($pool/@xmi:id))"/>
        </xsl:if>
      </xsl:for-each>
    </xsl:variable>

    <xsl:message select="'PERF-04 BEGIN message-flow-resolution'"/>
    <!-- Resolve each EA message flow exactly once across all collaborations.
         Preserve unique-participant and same-collaboration conditions. -->
    <xsl:variable name="resolved-message-flows" as="map(*)*">
     <xsl:for-each select="$doc//ea:MessageFlow">
      <xsl:variable name="flow" select="key('by-id',string(@base_ControlFlow),$doc)[@xmi:type='uml:ControlFlow'][1]"/>
      <xsl:variable name="a" select="if ($flow) then f:semantic(string($flow/@source),$doc) else ()"/>
      <xsl:variable name="b" select="if ($flow) then f:semantic(string($flow/@target),$doc) else ()"/>
      <xsl:variable name="pa" select="if ($a) then f:participant-for-node($a,$doc) else ()"/>
      <xsl:variable name="pb" select="if ($b) then f:participant-for-node($b,$doc) else ()"/>
      <xsl:variable name="oa" select="if ($pa) then f:owner($pa) else ()"/>
      <xsl:variable name="ob" select="if ($pb) then f:owner($pb) else ()"/>
      <xsl:if test="$flow and $a and $b and $pa and $pb and not($pa is $pb) and $oa and $ob and $oa is $ob">
       <xsl:sequence select="map{'owner':$oa,'id':f:bpmn-id($flow),'sourceRef':f:bpmn-id($a),'targetRef':f:bpmn-id($b)}"/>
      </xsl:if>
     </xsl:for-each>
    </xsl:variable>
    <xsl:message select="'PERF-04 END message-flow-resolution: eligible-flows=', count($resolved-message-flows)"/>
    <xsl:message select="'PERF-04 BEGIN collaborations'"/>
   <xsl:for-each select="$collaborations">
    <xsl:variable name="source" select="key('by-id',string(@base_Activity),$doc)[self::packagedElement][@xmi:type='uml:Activity'][1]"/>
    <xsl:if test="$source">
     <bpmn:collaboration id="{f:bpmn-id($source)}">
      <xsl:if test="f:ea-name($source,.)"><xsl:attribute name="name" select="f:ea-name($source,.)"/></xsl:if>
      <!-- EA-XSLT-11: participants are emitted only for a known collaboration owner.
           processRef is emitted only when it points to an existing BusinessProcess. -->
      <xsl:for-each select="$pools">
       <xsl:variable name="pool" select="key('by-id',string(@base_ActivityPartition),$doc)[@xmi:type='uml:ActivityPartition'][1]"/>
       <xsl:variable name="process" select="key('by-id',string(@processRef),$doc)[self::packagedElement][@xmi:type='uml:Activity'][1]"/>
       <xsl:variable name="process-stereotype" select="if ($process) then key('stereotype-by-base',string($process/@xmi:id),$doc)[self::ea:BusinessProcess] else ()"/>
       <xsl:if test="$pool and f:owner($pool) is $source">
        <bpmn:participant id="{f:bpmn-id($pool)}">
         <xsl:if test="$pool/@name"><xsl:attribute name="name" select="$pool/@name"/></xsl:if>
         <xsl:choose>
          <xsl:when test="$process-stereotype"><xsl:attribute name="processRef" select="f:bpmn-id($process)"/></xsl:when>
          <xsl:when test="not(normalize-space(@processRef)) and concat('EA_SYNTH_',string($pool/@xmi:id)) = $emitted-synthetic-process-ids"><xsl:attribute name="processRef" select="concat('EA_SYNTH_',string($pool/@xmi:id))"/></xsl:when>
         </xsl:choose>
        </bpmn:participant>
       </xsl:if>
      </xsl:for-each>
      <!-- Only cross-participant flows with uniquely resolved endpoints in this collaboration. -->
      <xsl:for-each select="$resolved-message-flows">
       <xsl:if test="map:get(.,'owner') is $source">
        <bpmn:messageFlow id="{map:get(.,'id')}" sourceRef="{map:get(.,'sourceRef')}" targetRef="{map:get(.,'targetRef')}"/>
       </xsl:if>
      </xsl:for-each>
     </bpmn:collaboration>
    </xsl:if>
   </xsl:for-each>
    <xsl:message select="'PERF-04 END collaborations'"/>
    <xsl:message select="'FLOW-CONV-03 BEGIN recovery'"/>
    <!-- Recovery collaboration: original collaboration ownership remains unchanged.
         Pool endpoints use local participant aliases, while activity endpoints keep
         their original BPMN ids. A future semantic pass should assign flows to
         native collaborations where possible. -->
    <xsl:variable name="recovered" as="map(*)*">
      <xsl:for-each select="$doc//ea:MessageFlow">
        <xsl:variable name="f" select="key('by-id',string(@base_ControlFlow),$doc)[@xmi:type='uml:ControlFlow'][1]"/>
        <xsl:variable name="a" select="key('by-id',string(($f/@source,$f/@start)[1]),$doc)[1]"/>
        <xsl:variable name="b" select="key('by-id',string(($f/@target,$f/@end)[1]),$doc)[1]"/>
        <xsl:variable name="pa" select="if ($a[@xmi:type='uml:ActivityPartition']) then $a else if ($a) then f:participant-for-node($a,$doc) else ()"/>
        <xsl:variable name="pb" select="if ($b[@xmi:type='uml:ActivityPartition']) then $b else if ($b) then f:participant-for-node($b,$doc) else ()"/>
        <xsl:if test="$f and $a and $b and $pa and $pb and not($pa is $pb) and not(f:bpmn-id($f) = $resolved-message-flows ! map:get(.,'id'))">
          <xsl:sequence select="map{'id':f:bpmn-id($f),'sourceRef':if ($a[@xmi:type='uml:ActivityPartition']) then concat('EA_FLOW03_',string($a/@xmi:id)) else f:bpmn-id($a),'targetRef':if ($b[@xmi:type='uml:ActivityPartition']) then concat('EA_FLOW03_',string($b/@xmi:id)) else f:bpmn-id($b),'pa':$pa,'pb':$pb}"/>
        </xsl:if>
        <xsl:if test="$f and (not($a) or not($b) or not($pa) or not($pb) or ($pa and $pb and $pa is $pb))">
          <xsl:message select="'FLOW-CONV-03 ANOMALY flow=',f:bpmn-id($f),' source=',string($f/@start),' target=',string($f/@end),' reason=unresolved-or-same-participant'"/>
        </xsl:if>
      </xsl:for-each>
    </xsl:variable>
    <xsl:if test="exists($recovered)">
      <bpmn:collaboration id="EA_FLOW03_RECOVERY" name="EA cross-context message flows">
        <xsl:for-each-group select="($recovered ! map:get(.,'pa'),$recovered ! map:get(.,'pb'))" group-by="string(@xmi:id)">
          <xsl:variable name="pool" select="current-group()[1]"/>
          <xsl:variable name="st" select="$pools[@base_ActivityPartition=string($pool/@xmi:id)][1]"/>
          <bpmn:participant id="{concat('EA_FLOW03_',string($pool/@xmi:id))}">
            <xsl:if test="$pool/@name"><xsl:attribute name="name" select="$pool/@name"/></xsl:if>
            <xsl:if test="$st and not(normalize-space($st/@processRef)) and concat('EA_SYNTH_',string($pool/@xmi:id)) = $emitted-synthetic-process-ids"><xsl:attribute name="processRef" select="concat('EA_SYNTH_',string($pool/@xmi:id))"/></xsl:if>
            <xsl:if test="$st and normalize-space($st/@processRef)">
              <xsl:variable name="proc" select="key('by-id',string($st/@processRef),$doc)[@xmi:type='uml:Activity'][1]"/>
              <xsl:if test="$proc and key('stereotype-by-base',string($proc/@xmi:id),$doc)[self::ea:BusinessProcess]"><xsl:attribute name="processRef" select="f:bpmn-id($proc)"/></xsl:if>
            </xsl:if>
          </bpmn:participant>
        </xsl:for-each-group>
        <xsl:for-each select="$recovered">
          <bpmn:messageFlow id="{map:get(.,'id')}" sourceRef="{map:get(.,'sourceRef')}" targetRef="{map:get(.,'targetRef')}"/>
        </xsl:for-each>
      </bpmn:collaboration>
    </xsl:if>
    <xsl:message select="'FLOW-CONV-03 END recovery: recovered=',count($recovered),' total=',count($recovered)+count($resolved-message-flows),' expected=',count($doc//ea:MessageFlow)"/>

   </bpmn:definitions>
 </xsl:template>

 <xsl:key name="di-by-id" match="*[@id]" use="@id"/>
 <!-- DI-48: BPMN-DI is generated in XSLT from the semantic result and source EA UML-DI. -->
 <xsl:template match="/">
  <xsl:variable name="source" select="."/>
  <xsl:variable name="semantic" as="document-node()">
   <xsl:document><xsl:call-template name="ea-semantic"/></xsl:document>
  </xsl:variable>
  <xsl:variable name="elements" select="$semantic//*[@id]"/>
  <xsl:for-each select="$semantic/bpmn:definitions">
   <xsl:copy>
    <xsl:copy-of select="@* | node()"/>
    <xsl:for-each select="$source//*[local-name()='Diagram'][@modelElement]">
     <xsl:variable name="diagram" select="."/>
     <xsl:variable name="plane-id" select="concat('EA_',string(@modelElement))"/>
     <xsl:if test="key('di-by-id',$plane-id,$semantic)[self::bpmn:process or self::bpmn:collaboration]">
      <!-- DATA-DI-09: resolve diagram processes through visible participants and visible semantic nodes. -->
      <xsl:variable name="visible-element-ids" as="xs:string*" select="$diagram/ownedElement[@modelElement]/concat('EA_',string(@modelElement))"/>
      <xsl:variable name="visible-participants" as="element(bpmn:participant)*" select="key('di-by-id',$visible-element-ids,$semantic)[self::bpmn:participant][@processRef]"/>
      <xsl:variable name="participant-processes" as="element(bpmn:process)*" select="key('di-by-id',$visible-participants/@processRef,$semantic)[self::bpmn:process]"/>
      <xsl:variable name="element-processes" as="element(bpmn:process)*" select="key('di-by-id',$visible-element-ids,$semantic)/ancestor::bpmn:process"/>
      <xsl:variable name="visible-processes" as="element(bpmn:process)*" select="$participant-processes | $element-processes"/>
      <xsl:message select="'DATA-DI-09 BEGIN diagram=',string($diagram/@xmi:id),' participant-processes=',count($participant-processes),' element-processes=',count($element-processes)"/>
      <xsl:variable name="shapes" as="element()*">
       <xsl:for-each select="$diagram/ownedElement[@modelElement][bounds]">
        <xsl:variable name="mid" select="string(@modelElement)"/>
        <xsl:variable name="direct" select="concat('EA_',$mid)"/>
        <xsl:variable name="lane" select="concat('EA_LANE_',$mid)"/>
        <xsl:variable name="group" select="concat('EA_GROUP_',$mid)"/>
        <!-- DATA-DI-01: select the data reference used by a task visible in this EA diagram.
             Do not guess when multiple owning processes remain possible. -->
        <xsl:variable name="data-refs" select="$elements[starts-with(@id,concat('EA_DATAREF_',$mid,'_'))][self::bpmn:dataStoreReference or self::bpmn:dataObjectReference]"/>
        <!-- DATA-DI-10: read-only instrumentation; no change to emission predicates. -->
        <xsl:variable name="store-refs" select="$data-refs[self::bpmn:dataStoreReference]"/>
        <xsl:variable name="store-local" select="$store-refs[parent::bpmn:process intersect $visible-processes]"/>
        <xsl:if test="exists($store-refs) or exists(key('di-by-id',($direct,$lane,$group),$semantic)[self::bpmn:dataStoreReference])">
         <xsl:message select="'DATA-DI-10 ARTIFACT diagram=',string($diagram/@xmi:id),' mid=',$mid,' refs=',count($data-refs),' stores=',count($store-refs),' store-local=',count($store-local),' owners=',string-join($store-refs/parent::bpmn:process/@id,','),' visible=',string-join($visible-processes/@id,','),' direct=',count(key('di-by-id',($direct,$lane,$group),$semantic))"/>
        </xsl:if>
        <xsl:variable name="local-data-refs" select="$data-refs[parent::bpmn:process intersect $visible-processes]"/>
        <!-- DATA-DI-12: an EA artifact resolves both to a global bpmn:dataStore
             and to its process-scoped dataStoreReference. The diagram shape must
             target the scoped reference, never the global definition. Only
             override the direct match when the local reference is unique. -->
        <xsl:variable name="direct-refs" select="key('di-by-id',($direct,$lane,$group),$semantic)"/>
        <!-- DATA-DI-16: global dataStore/dataObject definitions are not diagram
             instances. Never emit their BPMNShape. Preserve only a uniquely
             resolved process-scoped reference; unresolved cases are logged. -->
        <xsl:variable name="direct-di-refs" select="$direct-refs[not(self::bpmn:dataStore or self::bpmn:dataObject)]"/>
        <xsl:variable name="refs" select="if (count($local-data-refs)=1) then $local-data-refs else ($direct-di-refs | $local-data-refs)"/>
        <xsl:if test="exists($direct-refs[self::bpmn:dataStore or self::bpmn:dataObject]) and empty($local-data-refs)">
         <xsl:message select="'DATA-DI-16 UNRESOLVED_GLOBAL diagram=',string($diagram/@xmi:id),' artifact=',$mid,' owner-candidates=',string-join($store-refs/parent::bpmn:process/@id,','),' visible=',string-join($visible-processes/@id,',')"/>
        </xsl:if>
        <xsl:if test="exists($store-refs)">
         <xsl:message select="'DATA-DI-12 RESOLVE diagram=',string($diagram/@xmi:id),' artifact=',$mid,' direct-types=',string-join($direct-refs/local-name(),','),' local=',count($local-data-refs),' selected=',count($refs),' target=',string-join($refs/@id,',')"/>
        </xsl:if>
        <xsl:if test="count($refs)=1 and (every $v in (bounds/@x,bounds/@y,bounds/@width,bounds/@height) satisfies $v castable as xs:double) and xs:double(bounds/@width) gt 0 and xs:double(bounds/@height) gt 0">
         <bpmndi:BPMNShape id="{concat('EA_DI_',string(@xmi:id))}" bpmnElement="{string($refs[1]/@id)}">
          <dc:Bounds x="{bounds/@x}" y="{bounds/@y}" width="{bounds/@width}" height="{bounds/@height}"/>
         </bpmndi:BPMNShape>
        </xsl:if>
       </xsl:for-each>
      </xsl:variable>
      <xsl:message select="'DATA-DI-10 SHAPES diagram=',string($diagram/@xmi:id),' count=',count($shapes),' store-shapes=',count($shapes[starts-with(@bpmnElement,'EA_DATAREF_')])"/>
      <xsl:variable name="edges" as="element()*">
       <xsl:for-each select="$diagram/ownedElement[@modelElement][count(waypoint | point) ge 2]">
        <xsl:variable name="id" select="concat('EA_',string(@modelElement))"/>
        <xsl:if test="count(key('di-by-id',$id,$semantic)[self::bpmn:sequenceFlow or self::bpmn:messageFlow or self::bpmn:association or self::bpmn:dataInputAssociation or self::bpmn:dataOutputAssociation])=1 and (every $p in (waypoint | point) satisfies ($p/@x castable as xs:double and $p/@y castable as xs:double))">
         <bpmndi:BPMNEdge id="{concat('EA_DI_',string(@xmi:id))}" bpmnElement="{$id}">
          <xsl:for-each select="waypoint | point"><di:waypoint x="{@x}" y="{@y}"/></xsl:for-each>
         </bpmndi:BPMNEdge>
        </xsl:if>
       </xsl:for-each>
      </xsl:variable>
      <xsl:if test="exists($shapes)">
       <bpmndi:BPMNDiagram id="{concat('EA_DIAGRAM_',string(@xmi:id))}">
        <bpmndi:BPMNPlane id="{concat('EA_PLANE_',string(@xmi:id))}" bpmnElement="{$plane-id}">
         <xsl:sequence select="$shapes,$edges"/>
        </bpmndi:BPMNPlane>
       </bpmndi:BPMNDiagram>
      </xsl:if>
     </xsl:if>
    </xsl:for-each>
   </xsl:copy>
  </xsl:for-each>
 </xsl:template>
</xsl:stylesheet>
